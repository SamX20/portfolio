insert into sections (id, section, key, value)
values (
  'global-logo',
  'global',
  'logo',
  '/WhatsApp Image 2026-07-04 at 12.41.26 AM.jpeg'
)
on conflict (id) do update set value = excluded.value;
