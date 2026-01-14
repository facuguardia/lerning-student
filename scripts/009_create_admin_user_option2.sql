-- OPCIÓN 2: Crear usuario admin directamente en la base de datos
-- ==============================================================
-- Este script crea el usuario directamente en auth.users y profiles

-- Nota: Supabase maneja auth.users internamente, así que esta opción
-- requiere acceso directo a la base de datos de Supabase

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Generar un UUID para el nuevo usuario
  new_user_id := gen_random_uuid();
  
  -- Insertar en auth.users (tabla interna de Supabase)
  -- Nota: La contraseña debe estar hasheada con bcrypt
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'facuguar12@gmail.com',
    crypt('Admin1986!', gen_salt('bf')), -- Hash bcrypt de la contraseña
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    false,
    'authenticated',
    'authenticated'
  ) ON CONFLICT (email) DO NOTHING;

  -- Insertar o actualizar el perfil con rol admin
  INSERT INTO profiles (id, email, role, full_name)
  VALUES (
    new_user_id,
    'facuguar12@gmail.com',
    'admin',
    'Administrador'
  )
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin';

  -- Confirmar la creación
  RAISE NOTICE 'Usuario admin creado exitosamente con ID: %', new_user_id;
END $$;

-- Verificar que el usuario fue creado
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE email = 'facuguar12@gmail.com';
