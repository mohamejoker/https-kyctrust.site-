import { listAllServices, createService } from "@/lib/data"

function isUnlocked(req: Request) {
  const cookies = req.headers.get("cookie") || ""
  return /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
}

export async function GET() {
  const rows = await listAllServices()
  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  })
}

export async function POST(req: Request) {
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })
  const body = await req.json().catch(() => ({}))
  const { name, category, price, description, note, icon_image, active, popular, sort } = body || {}
  if (!name || !category || !price || !description) {
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
  }
  const id = await createService({ name, category, price, description, note, icon_image, active, popular, sort })
  return new Response(JSON.stringify({ ok: true, id }), { status: 200 })
}
