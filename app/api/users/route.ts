import { listUsers, createUser } from "@/lib/data"

export async function GET() {
  const data = await listUsers()
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { name, email, role = "editor", active = true } = body
  if (!name || !email) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
  const created = await createUser({ name, email, role, active })
  return new Response(JSON.stringify(created), { status: 200 })
}
