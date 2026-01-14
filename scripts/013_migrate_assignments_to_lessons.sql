-- Migration script to move existing assignments to lessons
-- This creates a default lesson for each module that has assignments

DO $$
DECLARE
  mod RECORD;
  lesson_id UUID;
BEGIN
  -- For each module that has assignments
  FOR mod IN 
    SELECT DISTINCT m.id as module_id, m.title, m.order_index
    FROM modules m
    INNER JOIN assignments a ON a.module_id = m.id
    WHERE a.lesson_id IS NULL
  LOOP
    -- Create a default lesson for this module
    INSERT INTO lessons (module_id, title, description, content, order_index, is_published)
    VALUES (
      mod.module_id,
      'Clase 1',
      'Clase principal del módulo',
      'Contenido de la clase',
      1,
      true
    )
    RETURNING id INTO lesson_id;
    
    -- Update assignments to reference the new lesson
    UPDATE assignments
    SET lesson_id = lesson_id
    WHERE module_id = mod.module_id AND lesson_id IS NULL;
  END LOOP;
END $$;
