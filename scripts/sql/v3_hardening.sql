-- Harden admin APIs usage patterns (indexes are already present in v2)
-- Optional: small helper to promote first user to admin for convenience
UPDATE users
SET role = 'admin'
WHERE id = (
  SELECT id FROM users ORDER BY id ASC LIMIT 1
)
AND role <> 'admin';
