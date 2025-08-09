import { ensureSchema } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function POST(req: Request) {
  await ensureSchema()
  const { email, name } = await req.json().catch(() => ({}))
  if (!email) return new Response(JSON.stringify({ error: "Email required" }), { status: 400 })

  const exist = await sql`SELECT 1 FROM users WHERE email = ${email} LIMIT 1`
  if (exist.length) {
    return new Response(JSON.stringify({ error: "User exists" }), { status: 400 })
  }
  const rows = await sql<{ id: number }[]>`
    INSERT INTO users (name, email, role, active) VALUES (${name || "User"}, ${email}, 'editor', true)
    RETURNING id
  `
  const id = rows[0].id
  const user = { id, name: name || "User", email, role: "editor", active: true }
  return new Response(JSON.stringify({ user: { ...user, id: String(user.id) }, token: "demo-token" }), { status: 200 })
}
