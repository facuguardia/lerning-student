-- OPCIÓN 1: Actualizar rol después de registrarse por la UI
-- ===========================================================
-- PASOS:
-- 1. Primero regístrate en la aplicación usando:
--    Email: facuguar12@gmail.com
--    Password: Admin1986!
-- 2. Luego ejecuta este script para cambiar tu rol a 'admin'

-- Actualizar el perfil existente a rol admin basado en el email
UPDATE profiles
SET role = 'admin'
WHERE email = 'facuguar12@gmail.com';

-- Verificar que el usuario ahora es admin
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE email = 'facuguar12@gmail.com';
