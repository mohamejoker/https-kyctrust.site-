import { insertSnapshot, listSnapshots } from "@/lib/data"

export async function GET() {
  const rows = await listSnapshots(10)
  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
  })
}

export async function POST(req: Request) {
  const cookies = req.headers.get("cookie") || ""
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
  if (!unlocked) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })

  const { locale, content } = await req.json().catch(() => ({}))
  if (!locale || !content) return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 })
  const id = await insertSnapshot(locale, content)
  return new Response(JSON.stringify({ id }), { status: 200 })
}
