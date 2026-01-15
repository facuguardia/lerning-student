SELECT id, email, role, full_name, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
