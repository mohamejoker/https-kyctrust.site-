-- v8_seed_default_content.sql
-- Seeds a minimal published content payload if missing (safe to run multiple times).
-- Adjust text as desired; this is a conservative default.

BEGIN;

-- Ensure base tables (no-ops if already exist)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed only if not present
DO $$
DECLARE
  exist INT;
  payload JSONB;
BEGIN
  SELECT COUNT(*) INTO exist FROM settings WHERE key = 'published_content';
  IF exist = 0 THEN
    payload := jsonb_build_object(
      'ar', jsonb_build_object(
        'site', jsonb_build_object('title', 'موقعك', 'description', 'منصة حديثة سريعة وآمنة'),
        'hero', jsonb_build_object('headline', 'أهلاً بك!', 'sub', 'ابدأ الآن بسهولة.')
      ),
      'en', jsonb_build_object(
        'site', jsonb_build_object('title', 'Your Site', 'description', 'Modern, fast, and secure'),
        'hero', jsonb_build_object('headline', 'Welcome!', 'sub', 'Get started with ease.')
      ),
      'design', jsonb_build_object(
        'theme', 'light',
        'accent', '#16a34a'
      )
    );
    INSERT INTO settings(key, value) VALUES ('published_content', payload);
  END IF;
END $$;

-- Optionally seed an "installed" marker; change or remove if your app sets this itself.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings WHERE key = 'installed') THEN
    INSERT INTO settings(key, value) VALUES ('installed', jsonb_build_object('ok', true, 'at', NOW()));
  END IF;
END $$;

COMMIT;
