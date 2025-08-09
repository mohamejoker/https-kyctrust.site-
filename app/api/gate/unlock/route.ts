import { ensureSchema, getSetting, setSetting } from "@/lib/schema"
import { hashPassword, comparePassword } from "@/lib/crypto"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  await ensureSchema()
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown"
  const key = `gate:unlock:${ip}`
  const rl = await rateLimit(key, 10, 60) // 10 requests per minute
  if (!rl.ok) {
    return new Response(JSON.stringify({ error: "Too many attempts" }), {
      status: 429,
      headers: { "Retry-After": "60" },
    })
  }

  const { password } = await req.json()
  if (!password || String(password).length < 4) {
    return new Response(JSON.stringify({ error: "Invalid password" }), { status: 400 })
  }

  const current = await getSetting("admin_password_hash")

  let ok = false
  if (!current) {
    // First-time setup: set password (store sha256 hex)
    const hash = await hashPassword(password)
    await setSetting("admin_password_hash", { hash })
    ok = true
  } else {
    ok = await comparePassword(password, current.hash)
  }

  if (!ok) return new Response(JSON.stringify({ error: "Wrong password" }), { status: 401 })

  const headers = new Headers()
  headers.append("Set-Cookie", `dash_unlock=1; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax; HttpOnly`)
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers })
}
