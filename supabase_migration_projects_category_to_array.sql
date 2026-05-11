-- Migration: convert projects.category from text to text[] and allow multiple categories
-- Run this SQL in Supabase SQL Editor to update existing projects data.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'projects'
      AND column_name = 'category'
      AND data_type = 'text'
  ) THEN
    ALTER TABLE projects
      ALTER COLUMN category TYPE text[] USING ARRAY[category];
    ALTER TABLE projects
      ALTER COLUMN category SET DEFAULT ARRAY['motion-design'];
  END IF;
END $$;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;

ALTER TABLE projects
  ADD CONSTRAINT projects_category_check
  CHECK (
    category <@ ARRAY['motion-design','social-ads','brand-films','explainer','video-editing','logo-animation','3d-modelling']::text[]
    AND array_length(category, 1) > 0
  );
