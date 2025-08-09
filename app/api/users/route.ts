import { ensureSchema } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function GET() {
  await ensureSchema()
  const rows = await sql<
    { id: number; name: string; email: string; role: string; active: boolean; created_at: string }[]
  >`SELECT id, name, email, role, active, created_at FROM users ORDER BY id DESC`
  const data = rows.map((r) => ({ ...r, id: String(r.id) }))
  return new Response(JSON.stringify(data), { status: 200 })
}

export async function POST(req: Request) {
  await ensureSchema()
  const body = await req.json()
  const { name, email, role = "editor", active = true } = body
  if (!name || !email) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })

  const rows = await sql<{ id: number }[]>
  `INSERT INTO users (name, email, role, active) VALUES (${name}, ${email}, ${role}, ${active}) RETURNING id`
  const id = String(rows[0].id)
  const created = { id, name, email, role, active }
  return new Response(JSON.stringify(created), { status: 200 })
}
