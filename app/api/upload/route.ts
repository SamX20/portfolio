import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'videos';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `portfolio-videos/${timestamp}-${sanitized}`;

    const uploadFile = async () => {
      return await supabaseAdmin!.storage.from(BUCKET_NAME).upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });
    };

    let { error: uploadError } = await uploadFile();

    if (uploadError) {
      const isBucketMissing = String(uploadError.message).toLowerCase().includes('bucket');
      if (isBucketMissing) {
        const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: true,
        });
        if (createError && !String(createError.message).toLowerCase().includes('already exists')) {
          console.error('Supabase bucket creation error:', createError);
          return NextResponse.json({ error: 'Failed to create storage bucket.' }, { status: 500 });
        }

        const retryResult = await uploadFile();
        uploadError = retryResult.error;
      }
    }

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file to Supabase Storage.' }, { status: 500 });
    }

    const publicUrlResponse = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!publicUrlResponse.data?.publicUrl) {
      console.error('Supabase public url response invalid:', publicUrlResponse);
      return NextResponse.json({ error: 'Failed to generate public URL.' }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrlResponse.data.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file.' }, { status: 500 });
  }
}
