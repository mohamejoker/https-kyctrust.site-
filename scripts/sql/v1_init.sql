-- Schema for the dashboard (users, settings, analytics, snapshots)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')) DEFAULT 'editor',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_daily (
  day DATE PRIMARY KEY,
  visitors INT NOT NULL,
  leads INT NOT NULL,
  orders INT NOT NULL,
  conversion_rate NUMERIC(5,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS content_snapshots (
  id BIGSERIAL PRIMARY KEY,
  locale TEXT NOT NULL CHECK (locale IN ('ar','en')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_snapshots_created ON content_snapshots (created_at DESC);
