import { hasSupabase } from "@/lib/supabase/helpers"

export async function GET() {
  return new Response(JSON.stringify({ supabase: hasSupabase() }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}
