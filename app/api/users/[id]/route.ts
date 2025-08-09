import { ensureSchema } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await ensureSchema()
  const body = await req.json()
  const idNum = Number(params.id)
  if (Number.isNaN(idNum)) return new Response(JSON.stringify({ error: "Bad id" }), { status: 400 })

  const fields = ["name", "email", "role", "active"] as const
  const patch: Record<string, any> = {}
  for (const k of fields) if (k in body) patch[k] = body[k]
  if (!Object.keys(patch).length) return new Response(JSON.stringify({ error: "Nothing to update" }), { status: 400 })

  await sql`UPDATE users SET 
    name = COALESCE(${patch.name}, name),
    email = COALESCE(${patch.email}, email),
    role = COALESCE(${patch.role}, role),
    active = COALESCE(${patch.active}, active)
    WHERE id = ${idNum}`

  const rows = await sql<{ id: number; name: string; email: string; role: string; active: boolean }[]>
  `SELECT id, name, email, role, active FROM users WHERE id = ${idNum} LIMIT 1`
  const user = rows[0] ? { ...rows[0], id: String(rows[0].id) } : null
  return new Response(JSON.stringify(user), { status: 200 })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await ensureSchema()
  const idNum = Number(params.id)
  if (Number.isNaN(idNum)) return new Response(JSON.stringify({ error: "Bad id" }), { status: 400 })
  await sql`DELETE FROM users WHERE id = ${idNum}`
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
