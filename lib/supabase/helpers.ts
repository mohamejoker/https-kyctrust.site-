import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Detect if Supabase is configured via env.
 */
export function hasSupabase() {
  const url = process.env.SUPABASE_SUPABASE_URL || process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SUPABASE_SERVICE_ROLE
  const anon = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && (service || anon))
}

let adminClient: SupabaseClient | null = null
let anonClient: SupabaseClient | null = null

/**
 * Server-side admin client (Service Role). Never expose this to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (adminClient) return adminClient
  const url = process.env.SUPABASE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SUPABASE_SERVICE_ROLE
  if (!url || !key) return null
  adminClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "kyctrust-admin" } },
  })
  return adminClient
}

/**
 * Client/browser anon client. Use only public operations and RLS-safe queries.
 */
export function getSupabaseAnon(): SupabaseClient | null {
  if (anonClient) return anonClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  anonClient = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "X-Client-Info": "kyctrust-web" } },
  })
  return anonClient
}
