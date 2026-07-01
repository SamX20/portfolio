alter table skills
  add column if not exists program text,
  add column if not exists program_skill text,
  add column if not exists editing_field text,
  add column if not exists sort_order integer default 0;

update skills
set
  program = coalesce(program, name),
  program_skill = coalesce(program_skill, name),
  editing_field = coalesce(editing_field, category),
  sort_order = coalesce(sort_order, 0);

alter table testimonials
  add column if not exists role text,
  add column if not exists email text,
  add column if not exists approved boolean not null default true,
  add column if not exists created_at timestamptz not null default now();

create index if not exists testimonials_created_at_idx on testimonials (created_at desc);
create index if not exists skills_sort_order_idx on skills (sort_order asc);
