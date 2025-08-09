-- Additional tables and indexes
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  ts TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_key_ts ON rate_limits (key, ts DESC);
CREATE INDEX IF NOT EXISTS idx_content_snapshots_locale_created ON content_snapshots (locale, created_at DESC);
