import { getSetting, setSetting } from "@/lib/schema"
import { hashPassword } from "@/lib/crypto"
import { encryptJSON } from "@/lib/secure-store"

function cookieHeaders() {
  const headers = new Headers()
  headers.append("Set-Cookie", `dash_unlock=1; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax; HttpOnly`)
  return headers
}

export async function GET() {
  const mark = (await getSetting("installed")) as { ok?: boolean } | null
  return new Response(JSON.stringify({ installed: Boolean(mark?.ok) }), { status: 200 })
}

export async function POST(req: Request) {
  const mark = (await getSetting("installed")) as { ok?: boolean } | null
  if (mark?.ok) return new Response(JSON.stringify({ error: "Already installed" }), { status: 400 })

  const { adminPassword, siteUrl, providers } = await req.json().catch(() => ({}))
  if (!adminPassword || String(adminPassword).length < 4) {
    return new Response(JSON.stringify({ error: "Weak or missing password" }), { status: 400 })
  }

  // 1) Set admin gate password
  const hash = await hashPassword(adminPassword)
  await setSetting("admin_password_hash", { hash })

  // 2) Optional: site URL configuration
  if (siteUrl) {
    await setSetting("site_config", { siteUrl })
  }

  // 3) Optional: encrypted provider keys -> runtime_secrets
  if (providers && typeof providers === "object") {
    const payload = encryptJSON({ providers })
    await setSetting("runtime_secrets", { payload })
  }

  // 4) Mark installed
  await setSetting("installed", { ok: true, at: new Date().toISOString() })

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: cookieHeaders() })
}
