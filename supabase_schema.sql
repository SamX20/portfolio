-- Sam Motion Portfolio - Supabase schema
-- Run this in the Supabase SQL editor before using the rebuilt admin.

create table if not exists projects (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  title_ar text,
  description text not null,
  description_ar text,
  category text[] not null default array['motion-design'],
  client text,
  role text,
  year integer not null default extract(year from now())::integer,
  duration text,
  technologies text[] default '{}',
  video_url text,
  embed_code text,
  thumbnail text,
  featured boolean default false,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects add column if not exists title_ar text;
alter table projects add column if not exists description_ar text;
alter table projects add column if not exists client text;
alter table projects add column if not exists role text;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'projects_category_check'
  ) then
    alter table projects drop constraint projects_category_check;
  end if;
end $$;

alter table projects
  add constraint projects_category_check
  check (
    category <@ array['motion-design','social-ads','brand-films','explainer','video-editing','logo-animation','3d-modelling']::text[]
    and array_length(category, 1) > 0
  );

create table if not exists stats (
  id text primary key,
  label text not null,
  value text not null
);

create table if not exists contact_info (
  id text primary key,
  icon text not null,
  title text not null,
  content text not null,
  href text default '#'
);

create table if not exists social_links (
  id text primary key,
  name text not null,
  url text not null default '#',
  icon text default '',
  sort_order integer default 0
);

create table if not exists sections (
  id text primary key,
  section text not null,
  key text not null,
  value text not null,
  unique(section, key)
);

create table if not exists profile (
  id text primary key default 'main',
  name text not null,
  title text not null,
  description text not null,
  avatar text,
  resume text
);

create table if not exists skills (
  id text primary key,
  name text not null,
  level integer not null check (level >= 0 and level <= 100),
  category text not null
);

create table if not exists testimonials (
  id text primary key,
  name text not null,
  company text not null,
  content text not null,
  rating integer not null check (rating >= 1 and rating <= 5)
);

insert into profile (id, name, title, description)
values (
  'main',
  'Sam',
  'Motion Graphics Designer and Video Editor',
  'I design animated stories, brand moments, and scroll-stopping video systems for digital campaigns.'
)
on conflict (id) do update set
  name = excluded.name,
  title = excluded.title,
  description = excluded.description;

insert into sections (id, section, key, value) values
  ('global-site_title', 'global', 'site_title', 'Sam Motion'),
  ('global-logo', 'global', 'logo', 'S'),
  ('global-language', 'global', 'language', 'en'),
  ('hero-title', 'hero', 'title', 'Sam turns motion into memory.'),
  ('hero-subtitle', 'hero', 'subtitle', 'Motion Graphics / Video Editing'),
  ('hero-description', 'hero', 'description', 'A cinematic portfolio for branded motion, social ads, explainers, and high-energy edits.'),
  ('hero-title-ar', 'hero', 'title_ar', 'سام يحوّل الحركة إلى تجربة تُتذكر.'),
  ('hero-subtitle-ar', 'hero', 'subtitle_ar', 'موشن جرافيك / مونتاج فيديو'),
  ('hero-description-ar', 'hero', 'description_ar', 'بورتفوليو سينمائي للأعمال الإعلانية، فيديوهات السوشيال، الشرح البصري، والمونتاج الإبداعي.'),
  ('hero-cta_text', 'hero', 'cta_text', 'Watch the reel'),
  ('hero-cta_link', 'hero', 'cta_link', '#projects'),
  ('hero-video_url', 'hero', 'video_url', ''),
  ('hero-video_url', 'hero', 'video_url', ''),
  ('about-title', 'about', 'title', 'Direction, rhythm, finish.'),
  ('about-content', 'about', 'content', 'I build motion pieces with a sharp edit, clear visual hierarchy, and a finish that feels ready for screens, campaigns, and clients.'),
  ('about-title-ar', 'about', 'title_ar', 'إخراج، إيقاع، ولمسة نهائية.'),
  ('about-content-ar', 'about', 'content_ar', 'أصمم أعمال موشن بإيقاع واضح، ترتيب بصري ذكي، ولمسة نهائية جاهزة للشاشات والحملات والعملاء.'),
  ('about-exp_years', 'about', 'experience_years', '5+'),
  ('about-proj_comp', 'about', 'projects_completed', '100+'),
  ('footer-copyright', 'footer', 'copyright', '© 2026 Sam. All rights reserved.'),
  ('footer-tagline', 'footer', 'tagline', 'Motion with taste. Edits with pulse.'),
  ('footer-tagline-ar', 'footer', 'tagline_ar', 'حركة بذوق. مونتاج بإحساس.')
on conflict (id) do update set value = excluded.value;

insert into stats (id, label, value) values
  ('projects_count', 'Motion pieces', '100+'),
  ('clients_count', 'Happy clients', '50+'),
  ('years_exp', 'Years editing', '5+')
on conflict (id) do update set label = excluded.label, value = excluded.value;

insert into skills (id, name, level, category) values
  ('skill-after-effects', 'Adobe After Effects', 96, 'motion-design'),
  ('skill-premiere', 'Adobe Premiere Pro', 92, 'video-editing'),
  ('skill-illustrator', 'Adobe Illustrator', 86, 'design'),
  ('skill-c4d', 'Cinema 4D', 78, '3d-motion')
on conflict (id) do update set name = excluded.name, level = excluded.level, category = excluded.category;

alter table projects enable row level security;
alter table stats enable row level security;
alter table contact_info enable row level security;
alter table social_links enable row level security;
alter table sections enable row level security;
alter table profile enable row level security;
alter table skills enable row level security;
alter table testimonials enable row level security;

drop policy if exists "public_read_projects" on projects;
drop policy if exists "public_read_stats" on stats;
drop policy if exists "public_read_contact" on contact_info;
drop policy if exists "public_read_social" on social_links;
drop policy if exists "public_read_sections" on sections;
drop policy if exists "public_read_profile" on profile;
drop policy if exists "public_read_skills" on skills;
drop policy if exists "public_read_testimonials" on testimonials;

create policy "public_read_projects" on projects for select using (true);
create policy "public_read_stats" on stats for select using (true);
create policy "public_read_contact" on contact_info for select using (true);
create policy "public_read_social" on social_links for select using (true);
create policy "public_read_sections" on sections for select using (true);
create policy "public_read_profile" on profile for select using (true);
create policy "public_read_skills" on skills for select using (true);
create policy "public_read_testimonials" on testimonials for select using (true);

-- Function to update sections safely
create or replace function update_sections(sections_data jsonb)
returns void
language plpgsql
security definer
as $$
begin
  -- Truncate the sections table
  truncate table sections;
  
  -- Insert new data
  insert into sections (id, section, key, value)
  select 
    (data->>'id')::text,
    (data->>'section')::text,
    (data->>'key')::text,
    (data->>'value')::text
  from jsonb_array_elements(sections_data) as data;
end;
$$;

-- No public write policies. Admin writes go through Next.js API routes with SUPABASE_SERVICE_ROLE_KEY.
