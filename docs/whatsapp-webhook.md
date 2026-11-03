# WhatsApp bot — contact form webhook

The website (xsamer.com) sends every contact-form message to the WhatsApp bot through a signed webhook.
The bot verifies the signature and forwards the message to the owner's WhatsApp number.

The website always saves the message in its own database **before** calling the bot, so if the bot is down
nothing is lost — the owner can press "Send again" in the admin "Inquiries" tab.

## Bot side (implemented in `aboalseen55-ai/WA-Anime-bot`)

- Handler: `services/xsamerHook.js`, wired in `services/dashboardServer.js` next to `/hooks/shatreen`.
- Endpoint: `POST https://samx.up.railway.app/hooks/xsamer`
- Env on Railway (service `WA-Anime-bot`):
  - `XSAMER_HOOK_SECRET` — same value as the website's `WHATSAPP_WEBHOOK_SECRET`.
  - `XSAMER_NOTIFY_JIDS` — optional, comma-separated; defaults to `DEVELOPER_JID`.
- Tests: `tests/xsamerHook.test.js`.

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

## Website side (already done)

Set these in Vercel → Project `portfolio` → Settings → Environment Variables (Production), then redeploy:

- `WHATSAPP_WEBHOOK_URL` — the bot endpoint, `https://samx.up.railway.app/hooks/xsamer`
- `WHATSAPP_WEBHOOK_SECRET` — the same secret as the bot's `XSAMER_HOOK_SECRET`
