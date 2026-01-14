-- Create lessons for existing assignments
-- Since assignments don't have module_id, we'll create a generic lesson for each module

-- First, create one lesson per module
INSERT INTO lessons (module_id, title, description, order_index, content)
SELECT 
  m.id as module_id,
  'Clase Principal' as title,
  'Clase principal del módulo ' || m.title as description,
  1 as order_index,
  m.content as content
FROM modules m
WHERE m.id IN (
  -- Only for modules that have quizzes (indicates active modules from seed data)
  SELECT DISTINCT module_id FROM quizzes
)
ON CONFLICT DO NOTHING;

-- Get the lesson IDs we just created and update assignments
-- Since we don't know which assignment belongs to which module,
-- we'll keep them unassigned for now and let the admin assign them later
-- OR you can manually assign them through the UI

-- Show what was created
SELECT 
  m.title as module_name,
  l.title as lesson_name,
  l.id as lesson_id
FROM lessons l
JOIN modules m ON l.module_id = m.id
ORDER BY m.order_index, l.order_index;

-- Show current assignments (they will have lesson_id = NULL until manually assigned)
SELECT 
  a.id,
  a.title,
  a.lesson_id,
  CASE 
    WHEN a.lesson_id IS NULL THEN 'Sin asignar - asignar desde Admin'
    ELSE 'Asignado'
  END as status
FROM assignments a
ORDER BY a.created_at;
