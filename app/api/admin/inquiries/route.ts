import { NextResponse } from 'next/server';
import { isAdminAuthed } from '@/lib/adminAuth';
import { deliverInquiry, Inquiry } from '@/lib/inquiries';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';

async function guard() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Database is not configured.' }, { status: 500 });
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;

  const { data, error } = await supabaseAdmin!
    .from('inquiries')
    .select('id, name, email, service, message, locale, status, delivery_error, delivery_attempts, delivered_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    inquiries: data || [],
    webhookConfigured: Boolean(process.env.WHATSAPP_WEBHOOK_URL && process.env.WHATSAPP_WEBHOOK_SECRET),
  });
}

/** Retry WhatsApp delivery for one inquiry. */
export async function POST(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await request.json().catch(() => ({ id: '' }));
  const { data, error } = await supabaseAdmin!.from('inquiries').select('*').eq('id', String(id || '')).single();
  if (error || !data) return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });

  const result = await deliverInquiry(data as Inquiry);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function DELETE(request: Request) {
  const denied = await guard();
  if (denied) return denied;

  const { id } = await request.json().catch(() => ({ id: '' }));
  const { error } = await supabaseAdmin!.from('inquiries').delete().eq('id', String(id || ''));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
