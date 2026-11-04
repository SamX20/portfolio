-- Migration: allow logo-animation in projects category constraint
-- Run this SQL in the Supabase SQL editor to update the existing projects constraint.

alter table projects drop constraint if exists projects_category_check;

alter table projects
  add constraint projects_category_check
  check (category in ('motion-design','social-ads','brand-films','explainer','video-editing','logo-animation'));
