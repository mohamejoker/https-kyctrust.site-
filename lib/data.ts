import { getSupabaseAdmin } from "@/lib/supabase/helpers"

// dynamic Neon fallback loader
async function getNeon() {
  const db = await import("@/lib/db")
  const schema = await import("@/lib/schema")
  return {
    sql: db.sql,
    ensureSchema: schema.ensureSchema,
    getSetting: schema.getSetting,
    setSetting: schema.setSetting,
  }
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
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; email: string; role: string; active: boolean; created_at: string }[]
  >`SELECT id, name, email, role, active, created_at FROM users ORDER BY id DESC`
  return mapId(rows as any)
}

export async function createUser(payload: { name: string; email: string; role?: string; active?: boolean }) {
  const role = payload.role ?? "editor"
  const active = payload.active ?? true
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .insert({ name: payload.name, email: payload.email, role, active })
      .select("id,name,email,role,active")
      .single()
    if (error) throw error
    return { ...data, id: String((data as any).id) }
  }
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  const rows = await sql<{ id: number }[]>`
    INSERT INTO users (name, email, role, active) VALUES (${payload.name}, ${payload.email}, ${role}, ${active})
    RETURNING id`
  return { id: String(rows[0].id), name: payload.name, email: payload.email, role, active }
}

export async function updateUser(payload: {
  id: string
  name?: string
  email?: string
  role?: string
  active?: boolean
}) {
  const idNum = Number(payload.id)
  if (Number.isNaN(idNum)) throw new Error("Bad id")
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("users")
      .update({ name: payload.name, email: payload.email, role: payload.role, active: payload.active })
      .eq("id", idNum)
      .select("id,name,email,role,active")
      .single()
    if (error) throw error
    return { ...data, id: String((data as any).id) }
  }
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  await sql`UPDATE users SET 
    name = COALESCE(${payload.name}, name),
    email = COALESCE(${payload.email}, email),
    role = COALESCE(${payload.role}, role),
    active = COALESCE(${payload.active}, active)
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
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  await sql`DELETE FROM users WHERE id = ${idNum}`
  return true
}

// SETTINGS (published content and general settings)
export async function getSettingValue<T = any>(key: string): Promise<T | null> {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb.from("settings").select("value").eq("key", key).maybeSingle()
    if (error && (error as any).code !== "PGRST116") throw error
    return (data?.value as T) ?? null
  }
  const { getSetting, ensureSchema } = await getNeon()
  await ensureSchema()
  return (await getSetting(key)) ?? null
}

export async function setSettingValue(key: string, value: any) {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { error } = await sb.from("settings").upsert({ key, value }).eq("key", key)
    if (error) throw error
    return true
  }
  const { setSetting } = await getNeon()
  await setSetting(key, value)
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
  const { sql, ensureSchema } = await getNeon()
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
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  const rows = await sql<{ id: number }[]>`
    INSERT INTO content_snapshots (locale, content) VALUES (${locale}, ${content}::jsonb) RETURNING id`
  return String(rows[0].id)
}

// PUBLISH
export async function getPublishedContent() {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb.rpc("rpc_get_published")
    if (!error && data) return data as any
  }
  return await getSettingValue("published_content")
}

export async function setPublishedContent(data: any) {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { error } = await sb.rpc("rpc_publish_content", { payload: data })
    if (!error) return true
  }
  await setSettingValue("published_content", data)
  return true
}

// REVIEWS
async function sha256Hex(input: string) {
  const { createHash } = await import("node:crypto")
  return createHash("sha256").update(input).digest("hex")
}

export async function listApprovedReviews(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error, count } = await sb
      .from("reviews")
      .select("id,name,rating,comment,created_at", { count: "exact" })
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1)
    if (error) throw error
    const ratings = (data || []).map((r: any) => r.rating as number)
    const avg = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 100) / 100 : 0
    return {
      items: (data || []).map((r: any) => ({ ...r, id: String(r.id) })),
      summary: { avg, count: count || 0, page, pageSize },
    }
  }
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; rating: number; comment: string; created_at: string }[]
  >`SELECT id, name, rating, comment, created_at FROM reviews WHERE status='approved' ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`
  const [{ avg, count }] = await sql<{ avg: string | null; count: number }[]>`
    SELECT ROUND(AVG(rating)::numeric,2) AS avg, COUNT(*)::int AS count FROM reviews WHERE status='approved'`
  return { items: mapId(rows as any), summary: { avg: avg ? Number(avg) : 0, count: count || 0, page, pageSize } }
}

export async function createReview(payload: {
  name: string
  email?: string
  rating: number
  comment: string
  ip?: string
  ua?: string
}) {
  const record = {
    name: payload.name,
    email: payload.email ?? null,
    rating: payload.rating,
    comment: payload.comment,
    status: "pending",
    ip_hash: payload.ip ? await sha256Hex(payload.ip) : null,
    ua_hash: payload.ua ? await sha256Hex(payload.ua) : null,
  }
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("reviews")
      .insert(record as any)
      .select("id")
      .single()
    if (error) throw error
    return String((data as any).id)
  }
  const { sql, ensureSchema } = await getNeon()
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
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  await sql`UPDATE reviews SET status = ${status} WHERE id = ${idNum}`
  return true
}

export async function listAllReviews(limit = 200) {
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
  const { sql, ensureSchema } = await getNeon()
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; rating: number; comment: string; status: string; created_at: string }[]
  >`SELECT id, name, rating, comment, status, created_at FROM reviews ORDER BY created_at DESC LIMIT ${limit}`
  return mapId(rows as any)
}

// SERVICES
export type ServiceRow = {
  id?: string
  name: string
  category: string
  price: string
  description: string
  note?: string | null
  icon_image?: string | null
  active?: boolean
  popular?: boolean
  sort?: number
  created_at?: string
}

export async function listPublicServices() {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("services")
      .select("id,name,category,price,description,note,icon_image,active,popular,sort,created_at")
      .eq("active", true)
      .order("sort", { ascending: true })
    if (error) throw error
    return (data || []).map((r: any) => ({ ...r, id: String(r.id) }))
  }
  // Fallback: serve from published content if defined
  const published = await getPublishedContent()
  const services = published?.ar?.services || published?.en?.services || []
  return services
}

export async function listAllServices() {
  const sb = getSupabaseAdmin()
  if (sb) {
    const { data, error } = await sb
      .from("services")
      .select("id,name,category,price,description,note,icon_image,active,popular,sort,created_at")
      .order("sort", { ascending: true })
    if (error) throw error
    return (data || []).map((r: any) => ({ ...r, id: String(r.id) }))
  }
  // fallback to published content
  return await listPublicServices()
}

export async function createService(s: ServiceRow) {
  const sb = getSupabaseAdmin()
  if (!sb) throw new Error("Supabase is not configured")
  const payload = {
    name: s.name,
    category: s.category,
    price: s.price,
    description: s.description,
    note: s.note ?? null,
    icon_image: s.icon_image ?? null,
    active: s.active ?? true,
    popular: s.popular ?? false,
    sort: s.sort ?? 0,
  }
  const { data, error } = await sb
    .from("services")
    .insert(payload as any)
    .select("id")
    .single()
  if (error) throw error
  return String((data as any).id)
}

export async function updateService(id: string, s: Partial<ServiceRow>) {
  const sb = getSupabaseAdmin()
  if (!sb) throw new Error("Supabase is not configured")
  const idNum = Number(id)
  if (Number.isNaN(idNum)) throw new Error("Bad id")
  const patch = {
    name: s.name,
    category: s.category,
    price: s.price,
    description: s.description,
    note: s.note,
    icon_image: s.icon_image,
    active: s.active,
    popular: s.popular,
    sort: s.sort,
  }
  const { error } = await sb
    .from("services")
    .update(patch as any)
    .eq("id", idNum)
  if (error) throw error
  return true
}

export async function deleteService(id: string) {
  const sb = getSupabaseAdmin()
  if (!sb) throw new Error("Supabase is not configured")
  const idNum = Number(id)
  if (Number.isNaN(idNum)) throw new Error("Bad id")
  const { error } = await sb.from("services").delete().eq("id", idNum)
  if (error) throw error
  return true
}
