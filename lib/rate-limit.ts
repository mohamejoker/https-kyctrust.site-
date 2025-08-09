import { sql } from "@/lib/db"

// Simple Postgres-based rate limiter
// key: typically user IP or a composite key per route
// limit: max requests within windowSeconds
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date()
  const windowStart = new Date(now.getTime() - windowSeconds * 1000)

  // Insert a row for the current attempt
  await sql`INSERT INTO rate_limits (key, ts) VALUES (${key}, NOW())`

  // Count how many requests within the window
  const rows = await sql<{ c: number }[]>`
    SELECT COUNT(*)::int as c 
    FROM rate_limits 
    WHERE key = ${key} AND ts >= ${windowStart.toISOString()}
  `
  const count = rows[0]?.c ?? 0

  const ok = count <= limit
  const remaining = Math.max(0, limit - count)
  const reset = new Date(now.getTime() + windowSeconds * 1000).toISOString()

  // Occasionally clean up old rows (best effort)
  // Note: This is optional and safe to remove
  await sql`DELETE FROM rate_limits WHERE ts < NOW() - INTERVAL '2 days'`

  return { ok, remaining, reset }
}
