import { getSupabaseAdmin } from "./supabase/helpers"

// Utility: dynamic imports to avoid evaluating Neon if Supabase is used
async function getNeonSql() {
  const mod = await import("@/lib/db")
  const schema = await import("@/lib/schema")
  return { sql: mod.sql, ensureSchema: schema.ensureSchema }
}

function mapId<T extends { id: number }>(rows: T[]) {
  return rows.map((r) => ({ ...r, id: String(r.id) }))
}

// USERS
export async function listUsers() {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .select("id,name,email,role,active,created_at")
      .order("id", { ascending: false })
    if (error) throw error
    return (data || []).map((r: any) => ({ ...r, id: String(r.id) }))
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; email: string; role: string; active: boolean; created_at: string }[]
  >`SELECT id, name, email, role, active, created_at FROM users ORDER BY id DESC`
  return mapId(rows)
}

export async function createUser(user: { name: string; email: string; role?: string; active?: boolean }) {
  const role = user.role ?? "editor"
  const active = user.active ?? true
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .insert({ name: user.name, email: user.email, role, active })
      .select("id,name,email,role,active")
      .single()
    if (error) throw error
    return { ...data, id: String(data.id) }
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<
    { id: number }[]
  >`INSERT INTO users (name, email, role, active) VALUES (${user.name}, ${user.email}, ${role}, ${active}) RETURNING id`
  return { id: String(rows[0].id), name: user.name, email: user.email, role, active }
}

export async function updateUser(user: { id: string; name?: string; email?: string; role?: string; active?: boolean }) {
  const sb = getSupabaseAdmin()
  const idNum = Number(user.id)
  if (Number.isNaN(idNum)) throw new Error("Bad id")
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .update({ name: user.name, email: user.email, role: user.role, active: user.active })
      .eq("id", idNum)
      .select("id,name,email,role,active")
      .single()
    if (error) throw error
    return { ...data, id: String(data.id) }
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  await sql`UPDATE users SET 
    name = COALESCE(${user.name}, name),
    email = COALESCE(${user.email}, email),
    role = COALESCE(${user.role}, role),
    active = COALESCE(${user.active}, active)
    WHERE id = ${idNum}`
  const rows = await sql<
    { id: number; name: string; email: string; role: string; active: boolean }[]
  >`SELECT id, name, email, role, active FROM users WHERE id = ${idNum} LIMIT 1`
  const u = rows[0]
  return u ? { ...u, id: String(u.id) } : null
}

export async function deleteUser(id: string) {
  const idNum = Number(id)
  if (Number.isNaN(idNum)) throw new Error("Bad id")
  const sb = getSupabaseAdmin()
  if (sb) {
    const { error } = await sb.from("users").delete().eq("id", idNum)
    if (error) throw error
    return true
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  await sql`DELETE FROM users WHERE id = ${idNum}`
  return true
}

// SETTINGS
export async function getSettingValue<T = any>(key: string): Promise<T | null> {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb.from("settings").select("value").eq("key", key).maybeSingle()
    if (error && error.code !== "PGRST116") throw error
    return (data?.value as T) ?? null
  }
  const { ensureSchema } = await getNeonSql()
  await ensureSchema()
  const schema = await import("@/lib/schema")
  return (await schema.getSetting(key)) ?? null
}

export async function setSettingValue(key: string, value: any) {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { error } = await sb.from("settings").upsert({ key, value }).eq("key", key)
    if (error) throw error
    return true
  }
  const schema = await import("@/lib/schema")
  await schema.setSetting(key, value)
  return true
}

// SNAPSHOTS
export async function listSnapshots(limit = 10) {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("content_snapshots")
      .select("id,locale,content,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map((r: any) => ({ ...r, id: String(r.id) }))
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<
    { id: number; locale: string; content: any; created_at: string }[]
  >`SELECT id, locale, content, created_at FROM content_snapshots ORDER BY created_at DESC LIMIT ${limit}`
  return mapId(rows as any)
}

export async function insertSnapshot(locale: "ar" | "en", content: any) {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb.from("content_snapshots").insert({ locale, content }).select("id").single()
    if (error) throw error
    return String((data as any).id)
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<{ id: number }[]>`
    INSERT INTO content_snapshots (locale, content) VALUES (${locale}, ${content}::jsonb) RETURNING id`
  return String(rows[0].id)
}

// REVIEWS
export async function listApprovedReviews(page = 1, pageSize = 10) {
  const sb = getSupabaseAdmin()
  const offset = (page - 1) * pageSize
  if (sb) {
    const { data, error, count } = await sb
      .from("reviews")
      .select("id,name,rating,comment,created_at", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)
    if (error) throw error
    const { data: agg, error: err2 } = await sb
      .from("reviews")
      .select("rating", { count: "exact" })
      .eq("status", "approved")
    if (err2) throw err2
    const ratings = (agg || []).map((r: any) => r.rating as number)
    const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100 : 0
    return {
      items: (data || []).map((r: any) => ({ ...r, id: String(r.id) })),
      summary: { avg, count: count || 0, page, pageSize },
    }
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; rating: number; comment: string; created_at: string }[]
  >`SELECT id, name, rating, comment, created_at FROM reviews WHERE status='approved' ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`
  const [{ avg, count }] = await sql<
    { avg: string | null; count: number }[]
  >`SELECT ROUND(AVG(rating)::numeric, 2) AS avg, COUNT(*)::int AS count FROM reviews WHERE status='approved'`
  return {
    items: mapId(rows as any),
    summary: { avg: avg ? Number(avg) : 0, count: count || 0, page, pageSize },
  }
}

export async function createReview(payload: {
  name: string
  email?: string
  rating: number
  comment: string
  ip?: string
  ua?: string
}) {
  const sb = getSupabaseAdmin()
  const record = {
    name: payload.name,
    email: payload.email ?? null,
    rating: payload.rating,
    comment: payload.comment,
    status: "pending",
    ip_hash: payload.ip ? await sha256Hex(payload.ip) : null,
    ua_hash: payload.ua ? await sha256Hex(payload.ua) : null,
  }
  if (sb) {
    const { data, error } = await sb
      .from("reviews")
      .insert(record as any)
      .select("id")
      .single()
    if (error) throw error
    return String((data as any).id)
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<{ id: number }[]>`
    INSERT INTO reviews (name, email_enc, rating, comment, status, ip_hash, ua_hash)
    VALUES (${record.name}, ${record.email}, ${record.rating}, ${record.comment}, 'pending', ${record.ip_hash}, ${record.ua_hash})
    RETURNING id`
  return String(rows[0].id)
}

export async function moderateReview(id: string, status: "approved" | "rejected") {
  const idNum = Number(id)
  if (Number.isNaN(idNum)) throw new Error("Bad id")
  const sb = getSupabaseAdmin()
  if (sb) {
    const { error } = await sb.from("reviews").update({ status }).eq("id", idNum)
    if (error) throw error
    return true
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  await sql`UPDATE reviews SET status = ${status} WHERE id = ${idNum}`
  return true
}

export async function listAllReviews(limit = 100) {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("reviews")
      .select("id,name,rating,comment,status,created_at")
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map((r: any) => ({ ...r, id: String(r.id) }))
  }
  const { sql, ensureSchema } = await getNeonSql()
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; rating: number; comment: string; status: string; created_at: string }[]
  >`SELECT id, name, rating, comment, status, created_at FROM reviews ORDER BY created_at DESC LIMIT ${limit}`
  return mapId(rows as any)
}

// CONTENT PUBLISH
export async function getPublishedContent() {
  // Prefer RPC if available
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data: payload, error } = await sb.rpc("rpc_get_published")
    if (!error && payload) return payload as any
    // fallback to settings row
    const val = await getSettingValue<any>("published_content")
    return val
  }
  return await getSettingValue<any>("published_content")
}

export async function setPublishedContent(data: any) {
  const sb = getSupabaseAdmin()
  if (sb) {
    // Try RPC (atomically update and snapshot)
    const { error } = await sb.rpc("rpc_publish_content", { payload: data })
    if (!error) return true
    // fallback: upsert value
    await setSettingValue("published_content", data)
    return true
  }
  await setSettingValue("published_content", data)
  return true
}

// Simple SHA-256
async function sha256Hex(input: string) {
  const { createHash } = await import("node:crypto")
  return createHash("sha256").update(input).digest("hex")
}
