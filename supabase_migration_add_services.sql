-- Services offered (managed from the admin "Services" tab)
create table if not exists public.services (
  id text primary key,
  type text not null default 'custom',
  title text not null default '',
  title_ar text,
  description text,
  description_ar text,
  icon text,
  featured boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.services enable row level security;
create policy "public_read_services" on public.services for select using (true);
create policy "service_write_services" on public.services for all to service_role using (true) with check (true);

-- Sub-items shown when a service is expanded, and linked projects
alter table public.services add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.services add column if not exists project_ids text[] not null default '{}';
