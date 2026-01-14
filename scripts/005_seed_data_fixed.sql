-- New seed data script with proper UUID generation to replace 004_seed_data.sql

-- Seed initial modules for the LMS
INSERT INTO public.modules (id, title, description, order_index, content, is_published) VALUES
  (gen_random_uuid(), 'Introducción al Desarrollo Web', 'Fundamentos de HTML, CSS y JavaScript para principiantes.', 1, 'En este módulo aprenderás los conceptos básicos del desarrollo web moderno.', true),
  (gen_random_uuid(), 'JavaScript Avanzado', 'Conceptos avanzados de JavaScript: closures, promesas y async/await.', 2, 'Profundiza en los conceptos más avanzados de JavaScript.', true),
  (gen_random_uuid(), 'React Fundamentals', 'Aprende los fundamentos de React: componentes, props y estado.', 3, 'React es una biblioteca de JavaScript para construir interfaces de usuario.', true),
  (gen_random_uuid(), 'Next.js y Server Components', 'Desarrollo full-stack con Next.js 14 y React Server Components.', 4, 'Next.js es el framework de React para producción.', true),
  (gen_random_uuid(), 'Bases de Datos y Supabase', 'Integración de bases de datos PostgreSQL con Supabase.', 5, 'Aprende a trabajar con bases de datos relacionales.', true)
ON CONFLICT DO NOTHING;

-- Get module IDs for reference
DO $$
DECLARE
  mod1_id uuid;
  mod2_id uuid;
  mod3_id uuid;
  mod4_id uuid;
  mod5_id uuid;
  quiz1_id uuid;
  quiz2_id uuid;
  quiz3_id uuid;
  quiz4_id uuid;
  quiz5_id uuid;
  q1_1 uuid;
  q1_2 uuid;
  q1_3 uuid;
  q1_4 uuid;
BEGIN
  -- Get module IDs by order
  SELECT id INTO mod1_id FROM public.modules WHERE order_index = 1;
  SELECT id INTO mod2_id FROM public.modules WHERE order_index = 2;
  SELECT id INTO mod3_id FROM public.modules WHERE order_index = 3;
  SELECT id INTO mod4_id FROM public.modules WHERE order_index = 4;
  SELECT id INTO mod5_id FROM public.modules WHERE order_index = 5;

  -- Seed quizzes for each module
  INSERT INTO public.quizzes (id, module_id, title, description, passing_score, time_limit_minutes) VALUES
    (gen_random_uuid(), mod1_id, 'Quiz: Fundamentos Web', 'Evalúa tus conocimientos sobre HTML, CSS y JavaScript básico.', 70, 15),
    (gen_random_uuid(), mod2_id, 'Quiz: JavaScript Avanzado', 'Demuestra tu dominio de conceptos avanzados de JS.', 70, 20),
    (gen_random_uuid(), mod3_id, 'Quiz: React Basics', 'Prueba tus conocimientos de React.', 70, 15),
    (gen_random_uuid(), mod4_id, 'Quiz: Next.js', 'Evalúa tu comprensión de Next.js.', 70, 20),
    (gen_random_uuid(), mod5_id, 'Quiz: Bases de Datos', 'Demuestra tus conocimientos de SQL y Supabase.', 70, 15)
  ON CONFLICT DO NOTHING
  RETURNING id INTO quiz1_id;

  -- Get quiz IDs
  SELECT id INTO quiz1_id FROM public.quizzes WHERE module_id = mod1_id;
  SELECT id INTO quiz2_id FROM public.quizzes WHERE module_id = mod2_id;
  SELECT id INTO quiz3_id FROM public.quizzes WHERE module_id = mod3_id;
  SELECT id INTO quiz4_id FROM public.quizzes WHERE module_id = mod4_id;
  SELECT id INTO quiz5_id FROM public.quizzes WHERE module_id = mod5_id;

  -- Seed quiz questions for Module 1
  INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index, points) VALUES
    (gen_random_uuid(), quiz1_id, '¿Qué significa HTML?', 1, 1),
    (gen_random_uuid(), quiz1_id, '¿Cuál es la propiedad CSS para cambiar el color de fondo?', 2, 1),
    (gen_random_uuid(), quiz1_id, '¿Cómo se declara una variable en JavaScript moderno?', 3, 1),
    (gen_random_uuid(), quiz1_id, '¿Qué etiqueta HTML se usa para enlaces?', 4, 1)
  ON CONFLICT DO NOTHING;

  -- Get question IDs for quiz 1
  SELECT id INTO q1_1 FROM public.quiz_questions WHERE quiz_id = quiz1_id AND order_index = 1;
  SELECT id INTO q1_2 FROM public.quiz_questions WHERE quiz_id = quiz1_id AND order_index = 2;
  SELECT id INTO q1_3 FROM public.quiz_questions WHERE quiz_id = quiz1_id AND order_index = 3;
  SELECT id INTO q1_4 FROM public.quiz_questions WHERE quiz_id = quiz1_id AND order_index = 4;

  -- Seed quiz options for Module 1 questions
  INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
    -- Question 1 options
    (gen_random_uuid(), q1_1, 'HyperText Markup Language', true, 1),
    (gen_random_uuid(), q1_1, 'High Tech Modern Language', false, 2),
    (gen_random_uuid(), q1_1, 'Home Tool Markup Language', false, 3),
    (gen_random_uuid(), q1_1, 'Hyperlink Text Mark Language', false, 4),
    -- Question 2 options
    (gen_random_uuid(), q1_2, 'background-color', true, 1),
    (gen_random_uuid(), q1_2, 'color-background', false, 2),
    (gen_random_uuid(), q1_2, 'bgcolor', false, 3),
    (gen_random_uuid(), q1_2, 'back-color', false, 4),
    -- Question 3 options
    (gen_random_uuid(), q1_3, 'const o let', true, 1),
    (gen_random_uuid(), q1_3, 'variable', false, 2),
    (gen_random_uuid(), q1_3, 'def', false, 3),
    (gen_random_uuid(), q1_3, 'dim', false, 4),
    -- Question 4 options
    (gen_random_uuid(), q1_4, '<a>', true, 1),
    (gen_random_uuid(), q1_4, '<link>', false, 2),
    (gen_random_uuid(), q1_4, '<href>', false, 3),
    (gen_random_uuid(), q1_4, '<url>', false, 4)
  ON CONFLICT DO NOTHING;

  -- Seed quiz questions for Module 2 (JavaScript Avanzado)
  INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index, points) VALUES
    (gen_random_uuid(), quiz2_id, '¿Qué es un closure en JavaScript?', 1, 1),
    (gen_random_uuid(), quiz2_id, '¿Cuál es la diferencia entre Promise y async/await?', 2, 1),
    (gen_random_uuid(), quiz2_id, '¿Qué hace el método .map() en arrays?', 3, 1),
    (gen_random_uuid(), quiz2_id, '¿Qué es el Event Loop?', 4, 1)
  ON CONFLICT DO NOTHING;

  -- Seed quiz questions for Module 3 (React)
  INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index, points) VALUES
    (gen_random_uuid(), quiz3_id, '¿Qué es JSX?', 1, 1),
    (gen_random_uuid(), quiz3_id, '¿Para qué se usa useState?', 2, 1),
    (gen_random_uuid(), quiz3_id, '¿Cuándo se ejecuta useEffect?', 3, 1),
    (gen_random_uuid(), quiz3_id, '¿Qué son las props en React?', 4, 1)
  ON CONFLICT DO NOTHING;

  -- Seed assignments
  INSERT INTO public.assignments (id, module_id, title, description, instructions, max_score, due_date) VALUES
    (gen_random_uuid(), mod1_id, 'Proyecto: Landing Page', 'Crea una landing page responsive usando HTML y CSS.', 'Debe incluir: header, hero section, features y footer. Sube el código a GitHub y despliega en Vercel.', 100, NOW() + INTERVAL '7 days'),
    (gen_random_uuid(), mod2_id, 'Proyecto: App de Tareas', 'Desarrolla una aplicación de lista de tareas con JavaScript vanilla.', 'Implementa: agregar, eliminar, marcar como completado y persistencia en localStorage.', 100, NOW() + INTERVAL '7 days'),
    (gen_random_uuid(), mod3_id, 'Proyecto: Dashboard React', 'Construye un dashboard interactivo con React.', 'Usa componentes funcionales, useState y useEffect. Incluye al menos 3 widgets diferentes.', 100, NOW() + INTERVAL '7 days'),
    (gen_random_uuid(), mod4_id, 'Proyecto: Blog con Next.js', 'Crea un blog completo usando Next.js App Router.', 'Implementa: páginas dinámicas, Server Components, metadata SEO y sistema de rutas.', 100, NOW() + INTERVAL '7 days'),
    (gen_random_uuid(), mod5_id, 'Proyecto: CRUD con Supabase', 'Desarrolla una aplicación CRUD conectada a Supabase.', 'Debe incluir: autenticación, operaciones CRUD, RLS policies y manejo de errores.', 100, NOW() + INTERVAL '7 days')
  ON CONFLICT DO NOTHING;

END $$;
