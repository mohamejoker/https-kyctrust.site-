import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let cachedAdmin: SupabaseClient | null = null
let cachedAnon: SupabaseClient | null = null

export function hasSupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && (service || anon))
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!hasSupabase()) return null
  if (cachedAdmin) return cachedAdmin
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  cachedAdmin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "kyctrust-admin" } },
  })
  return cachedAdmin
}

export function getSupabaseAnon(): SupabaseClient | null {
  if (cachedAnon) return cachedAnon
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  cachedAnon = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "X-Client-Info": "kyctrust-web" } },
  })
  return cachedAnon
}
