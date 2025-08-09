-- v9_performance_indexes.sql
-- Performance-focused indexes across the operational tables

BEGIN;

-- Settings
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings (key);

-- Content snapshots
CREATE INDEX IF NOT EXISTS idx_cs_locale_created ON content_snapshots (locale, created_at DESC);
-- Optional GIN indices for JSON queries (safe even if unused)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_cs_content_gin') THEN
    EXECUTE 'CREATE INDEX idx_cs_content_gin ON content_snapshots USING GIN (content);';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Some managed Postgres may restrict GIN on JSONB; ignore if fails
  NULL;
END$$;

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_status_rating ON reviews (status, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_ip_hash ON reviews (ip_hash);

-- Users (if present)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')) DEFAULT 'editor',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);

-- Analytics (if present)
CREATE TABLE IF NOT EXISTS analytics_daily (
  day DATE PRIMARY KEY,
  visitors INT NOT NULL,
  leads INT NOT NULL,
  orders INT NOT NULL,
  conversion_rate NUMERIC(5,2) NOT NULL
);
-- compound indexes unnecessary due to PK, but safe to analyze
ANALYZE;

COMMIT;
