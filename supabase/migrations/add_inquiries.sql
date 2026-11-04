-- Contact-form inquiries (private: RLS on, no public policies; only the server reads/writes)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  service text,
  message text not null,
  locale text,
  status text not null default 'pending' check (status in ('pending','delivered','failed')),
  delivery_error text,
  delivery_attempts integer not null default 0,
  delivered_at timestamptz,
  ip_hash text,
  created_at timestamptz not null default now()
);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_ip_hash_idx on public.inquiries (ip_hash, created_at desc);
alter table public.inquiries enable row level security;
