import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { deliverInquiry, Inquiry } from '@/lib/inquiries';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

const MAX_PER_HOUR = 5;
const LIMITS = { name: 120, email: 200, service: 120, message: 5000 };

function clean(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function hashIp(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  const salt = process.env.ADMIN_SESSION_SECRET || process.env.WHATSAPP_WEBHOOK_SECRET || 'xsam';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Contact form is not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill this field.
  if (clean(body.website, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const service = clean(body.service, LIMITS.service) || null;
  const message = clean(body.message, LIMITS.message);
  const locale = body.locale === 'ar' ? 'ar' : 'en';

  if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please fill in your name, a valid email and a message.' }, { status: 400 });
  }

  const ipHash = hashIp(request);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', since);

  if ((count ?? 0) >= MAX_PER_HOUR) {
    return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 });
  }

  const { data, error } = await supabaseAdmin
    .from('inquiries')
    .insert({ name, email, service, message, locale, ip_hash: ipHash })
    .select('*')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Could not save your message. Please try again.' }, { status: 500 });
  }

  // The message is safely stored; WhatsApp delivery is best-effort and retryable from the admin.
  await deliverInquiry(data as Inquiry);

  return NextResponse.json({ ok: true });
}
