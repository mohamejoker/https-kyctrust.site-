import { ensureSchema } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function GET(req: Request) {
  await ensureSchema()
  // Very basic: if gate is unlocked, return an "admin-like" user; else 401.
  const cookies = req.headers.get("cookie") || ""
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
  if (!unlocked) return new Response(JSON.stringify({ error: "Unauthenticated" }), { status: 401 })

  // Try to return any admin, or fallback to the first user.
  const admin = await sql<{ id: number; name: string; email: string; role: string; active: boolean }[]>`
    SELECT id, name, email, role, active FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1
  `
  if (admin.length) {
    const u = admin[0]
    return new Response(JSON.stringify({ user: { ...u, id: String(u.id) } }), { status: 200 })
  }
  const anyUser = await sql<{ id: number; name: string; email: string; role: string; active: boolean }[]>`
    SELECT id, name, email, role, active FROM users ORDER BY id ASC LIMIT 1
  `
  if (anyUser.length) {
    const u = anyUser[0]
    return new Response(JSON.stringify({ user: { ...u, id: String(u.id) } }), { status: 200 })
  }
  // If no users yet, return a temp object
  const user = { id: "0", name: "Admin", email: "admin@example.com", role: "admin", active: true }
  return new Response(JSON.stringify({ user }), { status: 200 })
}
