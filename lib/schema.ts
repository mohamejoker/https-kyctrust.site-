import { sql } from "./db"

export async function ensureSchema() {
  // id BIGSERIAL to avoid extension dependencies
  await sql`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`

  await sql`
  CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','editor','viewer')) DEFAULT 'editor',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`

  await sql`
  CREATE TABLE IF NOT EXISTS analytics_daily (
    day DATE PRIMARY KEY,
    visitors INT NOT NULL,
    leads INT NOT NULL,
    orders INT NOT NULL,
    conversion_rate NUMERIC(5,2) NOT NULL
  );`

  await sql`
  CREATE TABLE IF NOT EXISTS content_snapshots (
    id BIGSERIAL PRIMARY KEY,
    locale TEXT NOT NULL CHECK (locale IN ('ar','en')),
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`

  await sql`CREATE INDEX IF NOT EXISTS idx_content_snapshots_created ON content_snapshots (created_at DESC);`

  // New rate_limits table and indexes
  await sql`
  CREATE TABLE IF NOT EXISTS rate_limits (
    key TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL
  );`

  await sql`CREATE INDEX IF NOT EXISTS idx_rate_limits_key_ts ON rate_limits (key, ts DESC);`
  await sql`CREATE INDEX IF NOT EXISTS idx_content_snapshots_locale_created ON content_snapshots (locale, created_at DESC);`

  // New chat_sessions and chat_messages tables and indexes
  await sql`
  CREATE TABLE IF NOT EXISTS chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_prefs JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`

  await sql`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user','assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`

  await sql`CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created ON chat_messages (session_id, created_at DESC);`
}

export async function getSetting(key: string) {
  const rows = await sql<{ value: any }>`SELECT value FROM settings WHERE key = ${key} LIMIT 1`
  return rows[0]?.value
}
export async function setSetting(key: string, value: any) {
  await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}::jsonb)
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`
}
