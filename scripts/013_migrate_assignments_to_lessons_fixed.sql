-- Migration script to move assignments from modules to lessons
-- This creates a default lesson for each module and moves existing assignments to it

-- First, create a lesson for each existing module
INSERT INTO public.lessons (module_id, title, description, order_index, content)
SELECT 
  id,
  'Clase Principal de ' || title,
  'Clase principal del módulo ' || title,
  1,
  content
FROM public.modules
WHERE id IN (SELECT DISTINCT module_id FROM public.assignments)
ON CONFLICT DO NOTHING;

-- Now update all assignments to point to the newly created lessons
-- We'll link each assignment to the first lesson of its module
UPDATE public.assignments
SET lesson_id = (
  SELECT l.id 
  FROM public.lessons l 
  WHERE l.module_id = assignments.module_id 
  ORDER BY l.order_index 
  LIMIT 1
)
WHERE lesson_id IS NULL;

-- Verify the migration
SELECT 
  m.title AS module,
  l.title AS lesson,
  COUNT(a.id) AS assignment_count
FROM public.modules m
LEFT JOIN public.lessons l ON l.module_id = m.id
LEFT JOIN public.assignments a ON a.lesson_id = l.id
GROUP BY m.id, m.title, l.id, l.title
ORDER BY m.order_index, l.order_index;
