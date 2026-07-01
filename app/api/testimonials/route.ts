import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function cleanText(value: unknown, maxLength: number) {
  return String(value || '').trim().slice(0, maxLength);
}

function withoutMissingColumn(record: Record<string, unknown>, message: string) {
  const match = message.match(/Could not find the '([^']+)' column/);
  const column = match?.[1];

  if (!column || !(column in record)) return null;

  const next = { ...record };
  delete next[column];
  return next;
}

async function insertTestimonial(record: Record<string, unknown>) {
  let payload = { ...record };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const result = await supabaseAdmin!.from('testimonials').insert(payload);

    if (!result.error) return result;

    const fallback = withoutMissingColumn(payload, result.error.message);
    if (!fallback) return result;
    payload = fallback;
  }

  return {
    error: { message: 'Could not save testimonial because several database columns are missing.' },
  };
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase service role key is not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const name = cleanText(body.name, 80);
  const company = cleanText(body.company, 100);
  const role = cleanText(body.role, 100);
  const email = cleanText(body.email, 160);
  const content = cleanText(body.content, 900);
  const rating = Math.max(1, Math.min(5, Number(body.rating || 5)));

  if (!name || !company || !content || content.length < 12) {
    return NextResponse.json({ error: 'Please add your name, company, and a clear testimonial.' }, { status: 400 });
  }

  const { error } = await insertTestimonial({
    id: crypto.randomUUID(),
    name,
    company,
    role,
    email,
    content,
    rating,
    approved: true,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
