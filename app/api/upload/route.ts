import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const BUCKET_NAME = 'uploads';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin client is not configured.' }, { status: 500 });
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file received.' }, { status: 400 });
    }

    const fileData = await file.arrayBuffer();
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `${timestamp}-${sanitized}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(filePath, Buffer.from(fileData), { contentType: file.type, upsert: true });

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