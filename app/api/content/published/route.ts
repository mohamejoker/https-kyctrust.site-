import { rateLimit } from "@/lib/rate-limit"
import { getPublishedContent, setPublishedContent, insertSnapshot } from "@/lib/data"

export async function GET() {
  const payload = await getPublishedContent()
  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": "application/json",
  })
  return new Response(JSON.stringify(payload || null), { status: 200, headers })
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown"
  const rl = await rateLimit(`content:publish:${ip}`, 30, 300)
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Retry-After": "300" },
    })
  }
  const cookies = req.headers.get("cookie") || ""
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
  if (!unlocked) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })

  const { ar, en, design } = await req.json().catch(() => ({}))
  if (!ar || !en) {
    return new Response(JSON.stringify({ error: "Missing ar/en bundles" }), { status: 400 })
  }
  const data = { ar, en, design: design ?? null, updatedAt: new Date().toISOString() }
  await setPublishedContent(data)
  // best-effort snapshots
  await insertSnapshot("ar", ar).catch(() => {})
  await insertSnapshot("en", en).catch(() => {})
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
