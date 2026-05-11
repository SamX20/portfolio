import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'videos';

export const runtime = 'nodejs';

function sanitizeFileName(fileName: string) {
  const baseName = fileName.trim() || 'upload';
  return baseName.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

async function ensureStorageBucket() {
  if (!supabaseAdmin) return 'Supabase admin client is not configured.';

  const { data: bucket, error: getError } = await supabaseAdmin.storage.getBucket(BUCKET_NAME);
  if (bucket && !getError) return null;

  const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
    public: true,
  });

  if (createError && !String(createError.message).toLowerCase().includes('already exists')) {
    console.error('Supabase bucket creation error:', createError);
    return 'Failed to create storage bucket.';
  }

  return null;
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthed())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const fileName = typeof body.fileName === 'string' ? body.fileName : '';
    const contentType = typeof body.contentType === 'string' ? body.contentType : '';

    if (!fileName) {
      return NextResponse.json({ error: 'Missing file name.' }, { status: 400 });
    }

    if (!contentType || !/^(image|video)\//.test(contentType)) {
      return NextResponse.json({ error: 'Only image and video uploads are allowed.' }, { status: 400 });
    }

    const bucketError = await ensureStorageBucket();
    if (bucketError) {
      return NextResponse.json({ error: bucketError }, { status: 500 });
    }

    const timestamp = Date.now();
    const sanitized = sanitizeFileName(fileName);
    const filePath = `portfolio-videos/${timestamp}-${sanitized}`;

    const { data: signedUpload, error: signedUploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(filePath, { upsert: true });

    if (signedUploadError || !signedUpload?.token) {
      console.error('Supabase signed upload error:', signedUploadError);
      return NextResponse.json({ error: 'Failed to prepare direct upload.' }, { status: 500 });
    }

    const publicUrlResponse = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!publicUrlResponse.data?.publicUrl) {
      console.error('Supabase public url response invalid:', publicUrlResponse);
      return NextResponse.json({ error: 'Failed to generate public URL.' }, { status: 500 });
    }

    return NextResponse.json({
      bucket: BUCKET_NAME,
      path: signedUpload.path,
      token: signedUpload.token,
      url: publicUrlResponse.data.publicUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to prepare upload.' }, { status: 500 });
  }
}
