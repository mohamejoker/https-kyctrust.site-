import { sql } from "@/lib/db"

// Optional helper you can run once by hitting /api/admin/reviews/schema-helper
export async function ensureReviewsSchema() {
  await sql`
  CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email_enc TEXT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    ip_hash TEXT,
    ua_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews (status, created_at DESC);`
  await sql`CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews (rating);`
}
