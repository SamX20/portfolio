-- ================================================
-- Portfolio Dashboard - Supabase Schema
-- شغّل هذا الملف في Supabase SQL Editor
-- ================================================

-- 1. جدول المشاريع
create table if not exists projects (
  id          text primary key default gen_random_uuid()::text,
  title       text not null,
  description text not null,
  category    text not null check (category in ('video-editing','motion-design','promotional','commercial')),
  year        integer not null default extract(year from now())::integer,
  duration    text,
  technologies text[] default '{}',
  video_url   text,
  thumbnail   text,
  featured    boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. جدول الإحصائيات (الأرقام في Hero)
create table if not exists stats (
  id    text primary key,
  label text not null,
  value text not null
);

insert into stats (id, label, value) values
  ('projects_count', 'مشروع منجز',  '100+'),
  ('clients_count',  'عميل راضي',   '50+'),
  ('years_exp',      'سنوات خبرة',  '5+')
on conflict (id) do nothing;

-- 3. جدول معلومات التواصل
create table if not exists contact_info (
  id      text primary key,
  icon    text not null,
  title   text not null,
  content text not null,
  href    text default '#'
);

insert into contact_info (id, icon, title, content, href) values
  ('email',    '📧', 'البريد الإلكتروني', 'contact@example.com',          'mailto:contact@example.com'),
  ('phone',    '📱', 'الهاتف',            '+962 79 123 4567',              'tel:+962791234567'),
  ('location', '📍', 'الموقع',            'الأردن — عمّان',               '#'),
  ('hours',    '⏰', 'ساعات العمل',       '9:00 – 18:00 (أحد–خميس)',     '#')
on conflict (id) do nothing;

-- 4. جدول السوشيال ميديا
create table if not exists social_links (
  id         text primary key,
  name       text not null,
  url        text not null default '#',
  sort_order integer default 0
);

insert into social_links (id, name, url, sort_order) values
  ('facebook',  'Facebook',  '#', 1),
  ('instagram', 'Instagram', '#', 2),
  ('linkedin',  'LinkedIn',  '#', 3),
  ('youtube',   'YouTube',   '#', 4)
on conflict (id) do nothing;

-- 5. بيانات تجريبية للمشاريع
insert into projects (id, title, description, category, year, duration, technologies, featured, sort_order) values
  ('proj-1', 'إعلان منتج تجاري',    'إعلان احترافي لمنتج تجاري مع موشن جرافيك متقدم',          'commercial',    2024, '30 ثانية',  ARRAY['Premiere Pro','After Effects'], true,  1),
  ('proj-2', 'موشن جرافيك تعليمي',  'محتوى تعليمي بتصميم بصري جذاب وتحريك سلس',               'motion-design', 2024, '2 دقيقة',   ARRAY['After Effects','Illustrator'],  true,  2),
  ('proj-3', 'تغطية حفل موسيقي',   'تحرير فيديو احترافي لحفل موسيقي مع مونتاج إبداعي',       'video-editing', 2023, '5 دقائق',   ARRAY['Premiere Pro','DaVinci'],       false, 3),
  ('proj-4', 'فيديو ترويجي للشركة', 'فيديو تسويقي يعرض خدمات الشركة بأسلوب احترافي',          'promotional',   2024, '1 دقيقة',   ARRAY['After Effects','Cinema 4D'],    true,  4),
  ('proj-5', 'أنيميشن شعار',        'تحريك شعار الشركة بتأثيرات موشن جرافيك مبتكرة',          'motion-design', 2023, '10 ثوانٍ', ARRAY['After Effects'],                false, 5),
  ('proj-6', 'تغطية فعالية شركة',   'تحرير فيديو احترافي لتغطية فعالية شركة كبرى',            'video-editing', 2024, '3 دقائق',   ARRAY['Premiere Pro','Lightroom'],     false, 6)
on conflict (id) do nothing;

-- 6. تفعيل Row Level Security (RLS) - مهم للأمان
alter table projects     enable row level security;
alter table stats        enable row level security;
alter table contact_info enable row level security;
alter table social_links enable row level security;

-- سياسة القراءة العامة (الموقع يقرأ البيانات)
create policy "public_read_projects"     on projects     for select using (true);
create policy "public_read_stats"        on stats        for select using (true);
create policy "public_read_contact"      on contact_info for select using (true);
create policy "public_read_social"       on social_links for select using (true);

-- سياسة الكتابة (Service Role فقط - من الداشبورد)
create policy "service_write_projects"     on projects     for all using (true) with check (true);
create policy "service_write_stats"        on stats        for all using (true) with check (true);
create policy "service_write_contact"      on contact_info for all using (true) with check (true);
create policy "service_write_social"       on social_links for all using (true) with check (true);
