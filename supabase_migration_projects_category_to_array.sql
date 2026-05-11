-- Migration: convert projects.category from text to text[] and allow multiple categories
-- Run this SQL in Supabase SQL Editor to update existing projects data.

DO $$
DECLARE
  col_type text;
BEGIN
  SELECT udt_name INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'projects'
    AND column_name = 'category'
    AND table_schema = 'public';

  IF col_type = 'text' THEN
    EXECUTE 'ALTER TABLE projects ADD COLUMN category_new text[] DEFAULT ARRAY[''motion-design'']::text[]';
    EXECUTE 'UPDATE projects SET category_new = ARRAY[category]';
    EXECUTE 'ALTER TABLE projects DROP COLUMN category';
    EXECUTE 'ALTER TABLE projects RENAME COLUMN category_new TO category';
    EXECUTE 'ALTER TABLE projects ALTER COLUMN category SET DEFAULT ARRAY[''motion-design'']::text[]';
  END IF;
END $$;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE projects
  ADD CONSTRAINT projects_category_check
  CHECK (
    category <@ ARRAY['motion-design','social-ads','brand-films','explainer','video-editing','logo-animation','3d-modelling']::text[]
    AND array_length(category, 1) > 0
  );
