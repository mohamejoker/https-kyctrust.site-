-- v7_snapshots_and_functions.sql
-- Atomic publish, snapshot, and rollback helpers

BEGIN;

-- Ensure content_snapshots exists (it should already per earlier migrations)
CREATE TABLE IF NOT EXISTS content_snapshots (
  id         BIGSERIAL PRIMARY KEY,
  locale     TEXT NOT NULL CHECK (locale IN ('ar','en')),
  content    JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_snapshots_created ON content_snapshots (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_locale_created ON content_snapshots (locale, created_at DESC);

-- Settings table (for published JSON)
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upsert helper
CREATE OR REPLACE FUNCTION set_setting(k TEXT, v JSONB)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO settings(key, value)
  VALUES (k, v)
  ON CONFLICT (key)
  DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
END$$;

-- Publish content atomically and auto-snapshot per-locale
-- payload format: { "ar": {...}, "en": {...}, "design": {...optional...} }
CREATE OR REPLACE FUNCTION fn_publish_content(payload JSONB)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  arc JSONB;
  enc JSONB;
BEGIN
  IF payload IS NULL THEN
    RAISE EXCEPTION 'payload is null';
  END IF;

  arc := payload->'ar';
  enc := payload->'en';
  IF arc IS NULL OR enc IS NULL THEN
    RAISE EXCEPTION 'payload must include ar and en';
  END IF;

  PERFORM set_setting('published_content', payload);

  INSERT INTO content_snapshots(locale, content) VALUES ('ar', arc);
  INSERT INTO content_snapshots(locale, content) VALUES ('en', enc);

  RETURN TRUE;
END$$;

-- Snapshot helper for a single locale
CREATE OR REPLACE FUNCTION fn_snapshot_content(locale TEXT, content JSONB)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
  new_id BIGINT;
BEGIN
  IF locale NOT IN ('ar','en') THEN
    RAISE EXCEPTION 'locale must be ar or en';
  END IF;
  INSERT INTO content_snapshots(locale, content) VALUES (locale, content) RETURNING id INTO new_id;
  RETURN new_id;
END$$;

-- Rollback to specific snapshot_id:
-- 1) determine the locale/content in snapshot
-- 2) load published_content
-- 3) replace that locale in published_content and write back
-- 4) append a new snapshot for traceability
CREATE OR REPLACE FUNCTION fn_rollback_snapshot(snapshot_id BIGINT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
DECLARE
  snap RECORD;
  published JSONB;
  new_published JSONB;
BEGIN
  SELECT id, locale, content, created_at INTO snap
  FROM content_snapshots WHERE id = snapshot_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'snapshot % not found', snapshot_id;
  END IF;

  SELECT value INTO published FROM settings WHERE key = 'published_content';
  IF published IS NULL THEN
    RAISE EXCEPTION 'published_content setting is missing';
  END IF;

  IF snap.locale = 'ar' THEN
    new_published := jsonb_set(published, '{ar}', snap.content, TRUE);
  ELSE
    new_published := jsonb_set(published, '{en}', snap.content, TRUE);
  END IF;

  PERFORM set_setting('published_content', new_published);
  -- append a new snapshot to reflect rollback action
  INSERT INTO content_snapshots(locale, content) VALUES (snap.locale, snap.content);

  RETURN TRUE;
END$$;

COMMIT;
