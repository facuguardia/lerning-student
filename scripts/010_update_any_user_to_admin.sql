-- SCRIPT GENÉRICO: Actualizar cualquier usuario existente a admin
-- ================================================================
-- Usa este script para convertir cualquier usuario registrado en admin

-- Reemplaza 'email@example.com' con el email del usuario que quieres hacer admin
UPDATE profiles
SET role = 'admin'
WHERE email = 'TU_EMAIL_AQUI@ejemplo.com';

-- Para el usuario específico solicitado:
UPDATE profiles
SET role = 'admin'
WHERE email = 'facuguar12@gmail.com';

-- Verificar usuarios admin en el sistema
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
