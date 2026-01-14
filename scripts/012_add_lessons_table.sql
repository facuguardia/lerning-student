-- Add lessons table to support Module -> Lesson -> Assignment hierarchy
-- This allows each module to have multiple lessons (classes) and each lesson can have optional assignments

CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update assignments table to reference lessons instead of modules
ALTER TABLE public.assignments 
  DROP CONSTRAINT IF EXISTS assignments_module_id_fkey,
  DROP COLUMN IF EXISTS module_id,
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lesson ON public.assignments(lesson_id);

-- RLS policies for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_select_all" ON public.lessons
  FOR SELECT
  USING (true);

CREATE POLICY "lessons_admin_all" ON public.lessons
  FOR ALL
  USING (is_admin());
