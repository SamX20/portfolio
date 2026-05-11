-- Migration: add anime-edit to projects category constraint
-- Run this SQL in the Supabase SQL editor to update the existing projects constraint.

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE projects
  ADD CONSTRAINT projects_category_check
  CHECK (
    category <@ ARRAY['motion-design','social-ads','brand-films','explainer','video-editing','logo-animation','3d-modelling','anime-edit']::text[]
    AND array_length(category, 1) > 0
  );