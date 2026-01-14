-- Seed data for Vibe Learning LMS
-- Version 2: Simplified approach with direct inserts

-- Insert modules
INSERT INTO modules (id, title, description, order_index, passing_score) VALUES
('00000000-0000-0000-0000-000000000001', 'Introducción a JavaScript', 'Conceptos básicos de programación con JavaScript: variables, tipos de datos y operadores.', 1, 70),
('00000000-0000-0000-0000-000000000002', 'Control de Flujo', 'Aprende a usar condicionales, bucles y estructuras de control en JavaScript.', 2, 70),
('00000000-0000-0000-0000-000000000003', 'Funciones y Scope', 'Domina las funciones, parámetros, return y el concepto de scope en JavaScript.', 3, 70),
('00000000-0000-0000-0000-000000000004', 'Arrays y Objetos', 'Trabaja con estructuras de datos: arrays, objetos y sus métodos principales.', 4, 70),
('00000000-0000-0000-0000-000000000005', 'DOM y Eventos', 'Manipula el DOM y maneja eventos para crear páginas web interactivas.', 5, 70)
ON CONFLICT (id) DO NOTHING;

-- Insert quizzes
INSERT INTO quizzes (id, module_id, title, description, time_limit, passing_score) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Quiz: JavaScript Básico', 'Evalúa tus conocimientos sobre variables, tipos de datos y operadores.', 15, 70),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Quiz: Control de Flujo', 'Prueba tu comprensión de if, else, switch y bucles.', 20, 70),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Quiz: Funciones', 'Demuestra tu dominio de funciones, parámetros y scope.', 20, 70),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Quiz: Arrays y Objetos', 'Evalúa tus habilidades con estructuras de datos.', 25, 70),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Quiz: DOM y Eventos', 'Prueba tu conocimiento de manipulación del DOM.', 25, 70)
ON CONFLICT (id) DO NOTHING;

-- Insert questions for Quiz 1: JavaScript Básico
INSERT INTO quiz_questions (id, quiz_id, question_text, order_index) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '¿Cuál es la forma correcta de declarar una variable en JavaScript?', 1),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '¿Qué tipo de dato es "Hello World"?', 2),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '¿Cuál es el resultado de 5 + "5" en JavaScript?', 3),
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '¿Qué operador se usa para comparar valor y tipo?', 4),
('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '¿Cuál de estos NO es un tipo de dato primitivo en JavaScript?', 5)
ON CONFLICT (id) DO NOTHING;

-- Insert options for Question 1
INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000001', 'var name = "John";', true),
('20000000-0000-0000-0000-000000000001', 'variable name = "John";', false),
('20000000-0000-0000-0000-000000000001', 'v name = "John";', false),
('20000000-0000-0000-0000-000000000001', 'name := "John";', false);

-- Insert options for Question 2
INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000002', 'String', true),
('20000000-0000-0000-0000-000000000002', 'Number', false),
('20000000-0000-0000-0000-000000000002', 'Boolean', false),
('20000000-0000-0000-0000-000000000002', 'Object', false);

-- Insert options for Question 3
INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000003', '"55"', true),
('20000000-0000-0000-0000-000000000003', '10', false),
('20000000-0000-0000-0000-000000000003', 'Error', false),
('20000000-0000-0000-0000-000000000003', 'undefined', false);

-- Insert options for Question 4
INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000004', '===', true),
('20000000-0000-0000-0000-000000000004', '==', false),
('20000000-0000-0000-0000-000000000004', '=', false),
('20000000-0000-0000-0000-000000000004', '!=', false);

-- Insert options for Question 5
INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000005', 'Array', true),
('20000000-0000-0000-0000-000000000005', 'String', false),
('20000000-0000-0000-0000-000000000005', 'Number', false),
('20000000-0000-0000-0000-000000000005', 'Boolean', false);

-- Insert questions for Quiz 2: Control de Flujo
INSERT INTO quiz_questions (id, quiz_id, question_text, order_index) VALUES
('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', '¿Qué estructura usarías para ejecutar código múltiples veces?', 1),
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', '¿Cuál es la sintaxis correcta de un if statement?', 2),
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', '¿Qué hace la palabra clave "break" en un bucle?', 3)
ON CONFLICT (id) DO NOTHING;

-- Insert options for Quiz 2
INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000006', 'for loop', true),
('20000000-0000-0000-0000-000000000006', 'if statement', false),
('20000000-0000-0000-0000-000000000006', 'switch', false),
('20000000-0000-0000-0000-000000000006', 'function', false);

INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000007', 'if (condition) { }', true),
('20000000-0000-0000-0000-000000000007', 'if condition { }', false),
('20000000-0000-0000-0000-000000000007', 'if (condition)', false),
('20000000-0000-0000-0000-000000000007', 'if condition then { }', false);

INSERT INTO quiz_options (quiz_question_id, option_text, is_correct) VALUES
('20000000-0000-0000-0000-000000000008', 'Sale del bucle inmediatamente', true),
('20000000-0000-0000-0000-000000000008', 'Pausa el bucle', false),
('20000000-0000-0000-0000-000000000008', 'Reinicia el bucle', false),
('20000000-0000-0000-0000-000000000008', 'No hace nada', false);

-- Insert assignments
INSERT INTO assignments (id, module_id, title, description, due_date) VALUES
('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Proyecto: Calculadora Básica', 'Crea una calculadora simple usando JavaScript que pueda sumar, restar, multiplicar y dividir.', NOW() + INTERVAL '7 days'),
('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Proyecto: Juego de Adivinanza', 'Crea un juego donde el usuario debe adivinar un número usando bucles y condicionales.', NOW() + INTERVAL '14 days'),
('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Proyecto: Generador de Contraseñas', 'Desarrolla una función que genere contraseñas aleatorias con parámetros personalizables.', NOW() + INTERVAL '21 days'),
('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Proyecto: Lista de Tareas', 'Crea una aplicación de lista de tareas usando arrays y objetos.', NOW() + INTERVAL '28 days'),
('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Proyecto: Galería Interactiva', 'Construye una galería de imágenes interactiva manipulando el DOM.', NOW() + INTERVAL '35 days')
ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Modules: 5';
  RAISE NOTICE 'Quizzes: 5';
  RAISE NOTICE 'Questions: 8';
  RAISE NOTICE 'Assignments: 5';
END $$;
