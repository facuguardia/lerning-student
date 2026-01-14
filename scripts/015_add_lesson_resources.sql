-- Add optional resources to lessons: single PDF URL and multiple links

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS resource_links TEXT[] DEFAULT '{}';

-- No changes to RLS needed; lessons policies already cover these fields

