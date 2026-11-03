# WhatsApp bot — contact form webhook

The website (xsamer.com) sends every contact-form message to the WhatsApp bot through a signed webhook.
The bot verifies the signature and forwards the message to the owner's WhatsApp number.

The website always saves the message in its own database **before** calling the bot, so if the bot is down
nothing is lost — the owner can press "Send again" in the admin "Inquiries" tab.

## What the bot needs to add

1. A public HTTPS endpoint, for example `POST /webhooks/xsamer-inquiry`.
2. Two environment variables:
   - `XSAMER_WEBHOOK_SECRET` — a long random string. **The same value** goes into the website's Vercel settings as `WHATSAPP_WEBHOOK_SECRET`.
   - `OWNER_WHATSAPP_NUMBER` — the number that should receive the messages, in international format (for example `9627XXXXXXXX`).
3. For each valid request: send one WhatsApp message to `OWNER_WHATSAPP_NUMBER`, then reply `200`.

## The request

```
POST <your endpoint>
Content-Type: application/json
X-XSam-Timestamp: 1730640000            (unix seconds)
X-XSam-Signature: sha256=<hex>          (HMAC-SHA256, see below)
X-XSam-Delivery: <uuid>                 (unique per attempt)
```

Body:

```json
{
  "event": "inquiry.created",
  "id": "8b0c6a52-…",
  "name": "Ahmad",
  "email": "ahmad@example.com",
  "service": "Website Development",
  "message": "Hi, I need a website for my restaurant…",
  "locale": "ar",
  "created_at": "2026-11-03T10:15:00.000Z",
  "source": "xsamer.com"
}
```

`service` may be `null`. `message` is up to 5000 characters and may contain line breaks and Arabic text.

## Verifying the request (required)

The signature is `HMAC_SHA256(secret, "<timestamp>.<raw body>")` in lowercase hex, prefixed with `sha256=`.

Rules:

- Compute the HMAC over the **raw request body exactly as received** (do not re-serialize the parsed JSON).
- Compare with a **constant-time** comparison.
- Reject (`401`) if the signature is wrong or missing.
- Reject (`401`) if the timestamp is more than **5 minutes** away from the current time (stops replayed requests).
- Optional: ignore a repeated `id` you have already forwarded (the owner may press "Send again" after a timeout).

## Responses

- `200` — message forwarded to WhatsApp.
- `401` — bad signature / timestamp.
- `5xx` — WhatsApp sending failed. The website marks it "failed" and the owner can retry.

Respond within **8 seconds**; the website gives up after that and marks the message as failed.

## Suggested WhatsApp message

```
📩 New inquiry — xsamer.com
👤 {name}
✉️ {email}
🛠 {service or "—"}

{message}
```

## Reference implementation (Node.js + Express)

```js
import crypto from 'node:crypto';
import express from 'express';

const app = express();
const SECRET = process.env.XSAMER_WEBHOOK_SECRET;
const OWNER = process.env.OWNER_WHATSAPP_NUMBER;
const seen = new Set();

// Keep the raw body: the signature is computed over the exact bytes sent.
app.post('/webhooks/xsamer-inquiry', express.raw({ type: 'application/json', limit: '64kb' }), async (req, res) => {
  const timestamp = req.get('X-XSam-Timestamp') || '';
  const signature = req.get('X-XSam-Signature') || '';
  const raw = req.body.toString('utf8');

  if (!SECRET || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return res.sendStatus(401);

  const expected = 'sha256=' + crypto.createHmac('sha256', SECRET).update(`${timestamp}.${raw}`).digest('hex');
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.sendStatus(401);

  const inquiry = JSON.parse(raw);
  if (seen.has(inquiry.id)) return res.sendStatus(200);

  const text = [
    '📩 New inquiry — xsamer.com',
    `👤 ${inquiry.name}`,
    `✉️ ${inquiry.email}`,
    `🛠 ${inquiry.service || '—'}`,
    '',
    inquiry.message,
  ].join('\n');

  try {
    await sendWhatsAppMessage(OWNER, text); // use the bot's existing send function
    seen.add(inquiry.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to forward inquiry', error);
    res.sendStatus(502);
  }
});
```

## Website side (already done)

Set these in Vercel → Project `portfolio` → Settings → Environment Variables (Production), then redeploy:

- `WHATSAPP_WEBHOOK_URL` — the bot endpoint, e.g. `https://<bot-domain>/webhooks/xsamer-inquiry`
- `WHATSAPP_WEBHOOK_SECRET` — the same secret as the bot's `XSAMER_WEBHOOK_SECRET`
