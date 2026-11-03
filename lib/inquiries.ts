import { createHmac, randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  locale: string | null;
  status: 'pending' | 'delivered' | 'failed';
  delivery_error: string | null;
  delivery_attempts: number;
  delivered_at: string | null;
  created_at: string;
}

const WEBHOOK_TIMEOUT_MS = 8000;

/** Hex HMAC-SHA256 of `${timestamp}.${body}` — the bot recomputes this to verify the request. */
export function signPayload(secret: string, timestamp: string, body: string) {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

/**
 * Send one inquiry to the WhatsApp bot webhook and record the outcome.
 * The inquiry is always stored first, so a failure here never loses the message.
 */
export async function deliverInquiry(inquiry: Inquiry) {
  if (!supabaseAdmin) return { ok: false, error: 'Database is not configured.' };

  const url = process.env.WHATSAPP_WEBHOOK_URL;
  const secret = process.env.WHATSAPP_WEBHOOK_SECRET;
  let error: string | null = null;

  if (!url || !secret) {
    error = 'WhatsApp webhook is not configured (WHATSAPP_WEBHOOK_URL / WHATSAPP_WEBHOOK_SECRET).';
  } else {
    const body = JSON.stringify({
      event: 'inquiry.created',
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      service: inquiry.service,
      message: inquiry.message,
      locale: inquiry.locale,
      created_at: inquiry.created_at,
      source: 'xsamer.com',
    });
    const timestamp = String(Math.floor(Date.now() / 1000));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSam-Timestamp': timestamp,
          'X-XSam-Signature': `sha256=${signPayload(secret, timestamp, body)}`,
          'X-XSam-Delivery': randomUUID(),
        },
        body,
        signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
      });
      if (!response.ok) error = `Bot responded with HTTP ${response.status}.`;
    } catch (caught) {
      error = caught instanceof Error ? caught.message : 'Could not reach the bot.';
    }
  }

  await supabaseAdmin
    .from('inquiries')
    .update({
      status: error ? 'failed' : 'delivered',
      delivery_error: error,
      delivered_at: error ? null : new Date().toISOString(),
      delivery_attempts: inquiry.delivery_attempts + 1,
    })
    .eq('id', inquiry.id);

  return { ok: !error, error };
}
