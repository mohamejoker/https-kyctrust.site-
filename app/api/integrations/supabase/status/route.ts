import { hasSupabase, getSupabaseAdmin } from "@/lib/supabase/helpers"

export async function GET() {
  const enabled = hasSupabase()
  if (!enabled) return new Response(JSON.stringify({ enabled: false }), { status: 200 })
  const sb = getSupabaseAdmin()
  try {
    const { error } = await sb!.from("settings").select("key").limit(1)
    if (error) throw error
    return new Response(JSON.stringify({ enabled: true, ok: true }), { status: 200 })
  } catch (e: any) {
    return new Response(JSON.stringify({ enabled: true, ok: false, error: e?.message || "Supabase query failed" }), {
      status: 200,
    })
  }
}
