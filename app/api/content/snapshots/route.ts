import { ensureSchema } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function GET() {
  await ensureSchema()
  const rows = await sql<{ id: number; locale: string; content: any; created_at: string }[]>
  `SELECT id, locale, content, created_at FROM content_snapshots ORDER BY created_at DESC LIMIT 10`
  return new Response(JSON.stringify(rows.map((r) => ({ ...r, id: String(r.id) }))), {
    status: 200,
    headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
  })
}

export async function POST(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies);
  if (!unlocked) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 });

  await ensureSchema()
  const { locale, content } = await req.json()
  if (!locale || !content) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
  const rows = await sql<{ id: number }[]>`
    INSERT INTO content_snapshots (locale, content) VALUES (${locale}, ${content}::jsonb) RETURNING id`
  return new Response(JSON.stringify({ id: String(rows[0].id) }), { status: 200 })
}
