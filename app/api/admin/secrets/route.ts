import { ensureSchema, getSetting, setSetting } from "@/lib/schema"
import { rateLimit } from "@/lib/rate-limit"
import { decryptJSON, encryptJSON, mask } from "@/lib/secure-store"

type Secrets = {
  providers?: {
    xaiKey?: string
    groqKey?: string
    deepinfraKey?: string
  }
}

function isUnlocked(req: Request) {
  const cookies = req.headers.get("cookie") || ""
  return /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
}

export async function GET(req: Request) {
  await ensureSchema()
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })
  const raw = (await getSetting("runtime_secrets")) as { payload?: string } | null
  let secrets: Secrets = {}
  if (raw?.payload) {
    try {
      secrets = decryptJSON(raw.payload) as Secrets
    } catch {
      secrets = {}
    }
  }
  const masked = {
    providers: {
      xaiKey: secrets.providers?.xaiKey ? mask(secrets.providers.xaiKey) : "",
      groqKey: secrets.providers?.groqKey ? mask(secrets.providers.groqKey) : "",
      deepinfraKey: secrets.providers?.deepinfraKey ? mask(secrets.providers.deepinfraKey) : "",
    },
  }
  return new Response(JSON.stringify({ masked }), { status: 200 })
}

export async function PUT(req: Request) {
  await ensureSchema()
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown"
  const rl = await rateLimit(`admin:secrets:${ip}`, 20, 300)
  if (!rl.ok) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429 })

  const body = (await req.json().catch(() => ({}))) as Partial<Secrets>
  // Load existing, merge changes
  const raw = (await getSetting("runtime_secrets")) as { payload?: string } | null
  let curr: Secrets = {}
  if (raw?.payload) {
    try {
      curr = decryptJSON(raw.payload)
    } catch {
      curr = {}
    }
  }
  curr.providers = {
    ...curr.providers,
    ...(body.providers || {}),
  }

  // Remove keys explicitly set to empty string to allow deletion/reset
  for (const k of ["xaiKey", "groqKey", "deepinfraKey"] as const) {
    if (curr.providers?.[k] === "") {
      delete (curr.providers as any)[k]
    }
  }

  const payload = encryptJSON(curr)
  await setSetting("runtime_secrets", { payload })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
