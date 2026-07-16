create table if not exists skill_programs (
  id text primary key,
  name text not null unique,
  sort_order integer default 0
);

insert into skill_programs (id, name, sort_order)
select
  'program-' || substr(md5(program), 1, 12),
  program,
  min(sort_order)
from skills
where program is not null and btrim(program) <> ''
group by program
on conflict (name) do update set sort_order = excluded.sort_order;

alter table skill_programs enable row level security;
create index if not exists skill_programs_sort_order_idx on skill_programs (sort_order asc);
