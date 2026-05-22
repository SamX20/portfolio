create table if not exists clients (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique,
  logo_url text default '',
  website_url text default '',
  featured boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects
  add column if not exists client_id text references clients(id) on delete set null;

alter table clients enable row level security;

drop policy if exists "Allow public read clients" on clients;
create policy "Allow public read clients" on clients
  for select using (true);

drop policy if exists "Allow service role manage clients" on clients;
create policy "Allow service role manage clients" on clients
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

insert into clients (id, name, slug, featured, sort_order)
select
  gen_random_uuid()::text,
  trim(client),
  lower(regexp_replace(trim(client), '[^a-zA-Z0-9]+', '-', 'g')),
  true,
  row_number() over (order by trim(client))
from (
  select distinct client
  from projects
  where nullif(trim(client), '') is not null
) source
where not exists (
  select 1
  from clients
  where lower(clients.name) = lower(trim(source.client))
);

update projects
set client_id = clients.id
from clients
where projects.client_id is null
  and nullif(trim(projects.client), '') is not null
  and lower(clients.name) = lower(trim(projects.client));
