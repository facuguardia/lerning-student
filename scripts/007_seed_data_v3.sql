-- Seed data for LMS
-- Inserts sample modules, quizzes, questions, and assignments

-- Insert modules
INSERT INTO public.modules (id, title, description, order_index, content, is_published) VALUES
('10000000-0000-0000-0000-000000000001', 'Introducción a la Programación', 'Aprende los fundamentos de la programación y lógica computacional', 1, 'En este módulo aprenderás los conceptos básicos de programación, variables, tipos de datos y estructuras de control.', true),
('10000000-0000-0000-0000-000000000002', 'Estructuras de Datos', 'Domina las estructuras de datos fundamentales', 2, 'Arrays, listas, pilas, colas y árboles. Aprende cuándo y cómo usar cada estructura.', true),
('10000000-0000-0000-0000-000000000003', 'Algoritmos y Complejidad', 'Análisis de algoritmos y notación Big O', 3, 'Aprende a analizar la eficiencia de tus algoritmos y optimizar tu código.', true),
('10000000-0000-0000-0000-000000000004', 'Programación Orientada a Objetos', 'POO: clases, objetos, herencia y polimorfismo', 4, 'Diseña software usando los principios de la programación orientada a objetos.', true),
('10000000-0000-0000-0000-000000000005', 'Desarrollo Web Full Stack', 'Frontend y Backend con tecnologías modernas', 5, 'React, Next.js, Node.js, bases de datos y despliegue de aplicaciones.', true)
ON CONFLICT (id) DO NOTHING;

-- Insert quizzes for each module
INSERT INTO public.quizzes (id, module_id, title, description, passing_score, time_limit_minutes) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Quiz: Fundamentos de Programación', 'Evalúa tus conocimientos sobre conceptos básicos', 70, 30),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Quiz: Estructuras de Datos', 'Demuestra tu comprensión de arrays, listas y árboles', 70, 45),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Quiz: Análisis de Algoritmos', 'Evalúa tu capacidad para analizar complejidad', 70, 40),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Quiz: POO', 'Conceptos de programación orientada a objetos', 70, 35),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Quiz: Desarrollo Web', 'Evalúa tus conocimientos de desarrollo full stack', 70, 50)
ON CONFLICT (id) DO NOTHING;

-- Insert questions for Quiz 1
INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index, points) VALUES
('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '¿Qué es una variable en programación?', 1, 10),
('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '¿Cuál es el resultado de 5 + 3 * 2 en la mayoría de los lenguajes?', 2, 10),
('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '¿Qué estructura de control se usa para repetir código?', 3, 10),
('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '¿Qué es un tipo de dato booleano?', 4, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert options for question 1
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Un espacio en memoria que almacena un valor', true, 1),
('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Una función que retorna valores', false, 2),
('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Un tipo de bucle', false, 3),
('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'Un operador matemático', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert options for question 2
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '16', false, 1),
('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', '11', true, 2),
('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '30', false, 3),
('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', '8', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert options for question 3
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000003', 'if/else', false, 1),
('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000003', 'for/while', true, 2),
('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000003', 'switch/case', false, 3),
('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000003', 'try/catch', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert options for question 4
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
('40000000-0000-0000-0000-000000000013', '30000000-0000-0000-0000-000000000004', 'Un tipo que solo puede ser verdadero o falso', true, 1),
('40000000-0000-0000-0000-000000000014', '30000000-0000-0000-0000-000000000004', 'Un tipo numérico decimal', false, 2),
('40000000-0000-0000-0000-000000000015', '30000000-0000-0000-0000-000000000004', 'Un tipo de texto', false, 3),
('40000000-0000-0000-0000-000000000016', '30000000-0000-0000-0000-000000000004', 'Un tipo de lista', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert questions for Quiz 2 (Estructuras de Datos)
INSERT INTO public.quiz_questions (id, quiz_id, question_text, order_index, points) VALUES
('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '¿Qué es un array?', 1, 10),
('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', '¿Cuál es la complejidad temporal de acceder a un elemento en un array?', 2, 10),
('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', '¿Qué estructura sigue el principio LIFO (Last In First Out)?', 3, 10)
ON CONFLICT (id) DO NOTHING;

-- Insert options for Quiz 2 questions
INSERT INTO public.quiz_options (id, question_id, option_text, is_correct, order_index) VALUES
('40000000-0000-0000-0000-000000000017', '30000000-0000-0000-0000-000000000005', 'Una colección de elementos del mismo tipo', true, 1),
('40000000-0000-0000-0000-000000000018', '30000000-0000-0000-0000-000000000005', 'Una función recursiva', false, 2),
('40000000-0000-0000-0000-000000000019', '30000000-0000-0000-0000-000000000005', 'Un tipo de variable', false, 3),
('40000000-0000-0000-0000-000000000020', '30000000-0000-0000-0000-000000000005', 'Un operador lógico', false, 4),

('40000000-0000-0000-0000-000000000021', '30000000-0000-0000-0000-000000000006', 'O(n)', false, 1),
('40000000-0000-0000-0000-000000000022', '30000000-0000-0000-0000-000000000006', 'O(1)', true, 2),
('40000000-0000-0000-0000-000000000023', '30000000-0000-0000-0000-000000000006', 'O(log n)', false, 3),
('40000000-0000-0000-0000-000000000024', '30000000-0000-0000-0000-000000000006', 'O(n²)', false, 4),

('40000000-0000-0000-0000-000000000025', '30000000-0000-0000-0000-000000000007', 'Cola (Queue)', false, 1),
('40000000-0000-0000-0000-000000000026', '30000000-0000-0000-0000-000000000007', 'Pila (Stack)', true, 2),
('40000000-0000-0000-0000-000000000027', '30000000-0000-0000-0000-000000000007', 'Árbol (Tree)', false, 3),
('40000000-0000-0000-0000-000000000028', '30000000-0000-0000-0000-000000000007', 'Grafo (Graph)', false, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert assignments
INSERT INTO public.assignments (id, module_id, title, description, instructions, due_date, max_score) VALUES
('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Proyecto: Calculadora Básica', 'Desarrolla una calculadora con operaciones básicas', 'Crea una aplicación que realice suma, resta, multiplicación y división. Debe tener interfaz gráfica y manejar errores.', NOW() + INTERVAL '14 days', 100),
('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Proyecto: Lista de Tareas', 'Implementa una aplicación de gestión de tareas', 'Utiliza arrays y listas para crear un sistema CRUD de tareas. Debe permitir agregar, editar, eliminar y marcar como completadas.', NOW() + INTERVAL '14 days', 100),
('50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Proyecto: Algoritmos de Ordenamiento', 'Implementa y compara algoritmos de ordenamiento', 'Implementa al menos 3 algoritmos de ordenamiento (bubble sort, quick sort, merge sort) y compara su rendimiento.', NOW() + INTERVAL '14 days', 100),
('50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Proyecto: Sistema de Biblioteca', 'Diseña un sistema usando POO', 'Crea clases para Libro, Usuario, Biblioteca con herencia y polimorfismo. Debe manejar préstamos y devoluciones.', NOW() + INTERVAL '14 days', 100),
('50000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Proyecto: Aplicación Web Full Stack', 'Desarrolla una aplicación completa', 'Crea una aplicación web con frontend en React/Next.js, backend con API REST, base de datos y autenticación. Despliega en Vercel.', NOW() + INTERVAL '21 days', 100)
ON CONFLICT (id) DO NOTHING;
