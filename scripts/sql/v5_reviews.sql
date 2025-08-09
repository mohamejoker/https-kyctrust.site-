-- v5_reviews.sql
-- Reviews system with moderation and performance indexes.
-- Idempotent: safe to run multiple times.

BEGIN;

-- Core table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email_enc TEXT, -- store encrypted email payload as text (app encrypts/decrypts)
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  ip_hash TEXT,
  ua_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reviews_updated_at'
  ) THEN
    CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();
  END IF;
END$$;

-- Indexes for moderation and public listing
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews (created_at DESC);

-- Public view exposing only approved reviews, masking email if present.
CREATE OR REPLACE VIEW v_reviews_public AS
SELECT
  id,
  name,
  rating,
  comment,
  created_at
FROM reviews
WHERE status = 'approved'
ORDER BY created_at DESC;

COMMENT ON VIEW v_reviews_public IS 'Public-approved reviews with masked email';

-- Aggregation helper view for widgets
CREATE OR REPLACE VIEW v_reviews_stats AS
SELECT
  COALESCE(ROUND(AVG(rating)::numeric, 2), 0)::numeric AS avg_rating,
  COUNT(*)::int AS total_reviews
FROM reviews
WHERE status = 'approved';

COMMIT;
