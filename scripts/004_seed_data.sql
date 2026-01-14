-- Seed initial modules for the LMS
INSERT INTO public.modules (id, title, description, order_index, content, is_published) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Introduccion al Desarrollo Web', 'Fundamentos de HTML, CSS y JavaScript para principiantes.', 1, 'En este modulo aprenderás los conceptos básicos del desarrollo web moderno.', true),
  ('22222222-2222-2222-2222-222222222222', 'JavaScript Avanzado', 'Conceptos avanzados de JavaScript: closures, promesas y async/await.', 2, 'Profundiza en los conceptos más avanzados de JavaScript.', true),
  ('33333333-3333-3333-3333-333333333333', 'React Fundamentals', 'Aprende los fundamentos de React: componentes, props y estado.', 3, 'React es una biblioteca de JavaScript para construir interfaces de usuario.', true),
  ('44444444-4444-4444-4444-444444444444', 'Next.js y Server Components', 'Desarrollo full-stack con Next.js 14 y React Server Components.', 4, 'Next.js es el framework de React para producción.', true),
  ('55555555-5555-5555-5555-555555555555', 'Bases de Datos y Supabase', 'Integración de bases de datos PostgreSQL con Supabase.', 5, 'Aprende a trabajar con bases de datos relacionales.', true)
ON CONFLICT DO NOTHING;

-- Seed quizzes for each module
INSERT INTO public.quizzes (id, module_id, title, description, passing_score, time_limit_minutes) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Quiz: Fundamentos Web', 'Evalúa tus conocimientos sobre HTML, CSS y JavaScript básico.', 70, 15),
  ('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Quiz: JavaScript Avanzado', 'Demuestra tu dominio de conceptos avanzados de JS.', 70, 20),
  ('aaaa3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Quiz: React Basics', 'Prueba tus conocimientos de React.', 70, 15),
  ('aaaa4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Quiz: Next.js', 'Evalúa tu comprensión de Next.js.', 70, 20),
  ('aaaa5555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Quiz: Bases de Datos', 'Demuestra tus conocimientos de SQL y Supabase.', 70, 15)
ON CONFLICT DO NOTHING;

-- Seed quiz questions for Module 1
INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index, points) VALUES
  ('q1111111-1111-1111-1111-111111111111', 'aaaa1111-1111-1111-1111-111111111111', '¿Qué significa HTML?', 1, 1),
  ('q1111111-1111-1111-1111-111111111112', 'aaaa1111-1111-1111-1111-111111111111', '¿Cuál es la propiedad CSS para cambiar el color de fondo?', 2, 1),
  ('q1111111-1111-1111-1111-111111111113', 'aaaa1111-1111-1111-1111-111111111111', '¿Cómo se declara una variable en JavaScript moderno?', 3, 1),
  ('q1111111-1111-1111-1111-111111111114', 'aaaa1111-1111-1111-1111-111111111111', '¿Qué etiqueta HTML se usa para enlaces?', 4, 1)
ON CONFLICT DO NOTHING;

-- Seed quiz options for Module 1 questions
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
  -- Question 1 options
  ('o1111111-1111-1111-1111-111111111111', 'q1111111-1111-1111-1111-111111111111', 'HyperText Markup Language', true, 1),
  ('o1111111-1111-1111-1111-111111111112', 'q1111111-1111-1111-1111-111111111111', 'High Tech Modern Language', false, 2),
  ('o1111111-1111-1111-1111-111111111113', 'q1111111-1111-1111-1111-111111111111', 'Home Tool Markup Language', false, 3),
  ('o1111111-1111-1111-1111-111111111114', 'q1111111-1111-1111-1111-111111111111', 'Hyperlink Text Mark Language', false, 4),
  -- Question 2 options
  ('o1111111-1111-1111-1111-111111111121', 'q1111111-1111-1111-1111-111111111112', 'background-color', true, 1),
  ('o1111111-1111-1111-1111-111111111122', 'q1111111-1111-1111-1111-111111111112', 'color-background', false, 2),
  ('o1111111-1111-1111-1111-111111111123', 'q1111111-1111-1111-1111-111111111112', 'bgcolor', false, 3),
  ('o1111111-1111-1111-1111-111111111124', 'q1111111-1111-1111-1111-111111111112', 'back-color', false, 4),
  -- Question 3 options
  ('o1111111-1111-1111-1111-111111111131', 'q1111111-1111-1111-1111-111111111113', 'const o let', true, 1),
  ('o1111111-1111-1111-1111-111111111132', 'q1111111-1111-1111-1111-111111111113', 'variable', false, 2),
  ('o1111111-1111-1111-1111-111111111133', 'q1111111-1111-1111-1111-111111111113', 'def', false, 3),
  ('o1111111-1111-1111-1111-111111111134', 'q1111111-1111-1111-1111-111111111113', 'dim', false, 4),
  -- Question 4 options
  ('o1111111-1111-1111-1111-111111111141', 'q1111111-1111-1111-1111-111111111114', '<a>', true, 1),
  ('o1111111-1111-1111-1111-111111111142', 'q1111111-1111-1111-1111-111111111114', '<link>', false, 2),
  ('o1111111-1111-1111-1111-111111111143', 'q1111111-1111-1111-1111-111111111114', '<href>', false, 3),
  ('o1111111-1111-1111-1111-111111111144', 'q1111111-1111-1111-1111-111111111114', '<url>', false, 4)
ON CONFLICT DO NOTHING;

-- Seed assignments
INSERT INTO public.assignments (id, module_id, title, description, instructions, max_score) VALUES
  ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Proyecto: Landing Page', 'Crea una landing page responsive usando HTML y CSS.', 'Debe incluir: header, hero section, features y footer. Sube el código a GitHub y despliega en Vercel.', 100),
  ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Proyecto: App de Tareas', 'Desarrolla una aplicación de lista de tareas con JavaScript vanilla.', 'Implementa: agregar, eliminar, marcar como completado y persistencia en localStorage.', 100),
  ('b3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Proyecto: Dashboard React', 'Construye un dashboard interactivo con React.', 'Usa componentes funcionales, useState y useEffect. Incluye al menos 3 widgets diferentes.', 100)
ON CONFLICT DO NOTHING;
