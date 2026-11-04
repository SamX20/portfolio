# XSam Studio — xsamer.com

Website and admin for XSam Studio: websites, online stores, video editing, motion design, logos and branding.

Built with Next.js (App Router), React, Tailwind CSS and Supabase. Hosted on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

## Environment variables

| Name | What it is for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase connection (reads the site content) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used by the admin and the contact form |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Storage bucket for uploads (default `videos`) |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | Admin login at `/admin` |
| `WHATSAPP_WEBHOOK_URL`, `WHATSAPP_WEBHOOK_SECRET` | Forward contact-form messages to the WhatsApp bot — see `docs/whatsapp-webhook.md` |
| `OPENAI_API_KEY`, `OPENAI_METADATA_MODEL` | AI drafts for project titles and descriptions in the video optimizer |

## Where things are

- `app/page.tsx` — home page (loads all content from Supabase)
- `app/project/[id]` — one page per project, with its own title and preview for Google and social apps
- `app/admin` — the admin dashboard
- `app/api/inquiries` — contact form; saves the message, then sends it to WhatsApp
- `components/` — site sections (Hero, Services, Portfolio, …) and the logo (`Logo.tsx`)
- `public/brand` — logo files, icons and logo animations
- `public/media` — compressed showreels and their poster frames
- `supabase/` — database schema and migrations
