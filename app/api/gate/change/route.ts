import { ensureSchema, getSetting, setSetting } from "@/lib/schema"
import { comparePassword, hashPassword } from "@/lib/crypto"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  await ensureSchema()
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown"
  const key = `gate:change:${ip}`
  const rl = await rateLimit(key, 20, 300) // 20 requests per 5 minutes
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Retry-After": "300" },
    })
  }

  const cookies = req.headers.get("cookie") || ""
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
  if (!unlocked) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })

  const { currentPassword, newPassword } = await req.json()
  if (!newPassword || String(newPassword).length < 4) {
    return new Response(JSON.stringify({ error: "Weak password" }), { status: 400 })
  }

  const current = await getSetting("admin_password_hash")
  if (current) {
    const ok = await comparePassword(currentPassword ?? "", current.hash)
    if (!ok) return new Response(JSON.stringify({ error: "Wrong current password" }), { status: 401 })
  }
  const hash = await hashPassword(newPassword)
  await setSetting("admin_password_hash", { hash })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
