import { ensureSchema, getSetting, setSetting } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function GET(_: Request, { params }: { params: { key: string } }) {
  await ensureSchema()
  const v = await getSetting(params.key)
  return new Response(JSON.stringify(v ?? null), { status: 200 })
}

export async function PUT(req: Request, { params }: { params: { key: string } }) {
  const cookies = req.headers.get("cookie") || "";
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies);
  if (!unlocked) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 });

  await ensureSchema()
  const value = await req.json()
  await setSetting(params.key, value)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export async function DELETE(req: Request, { params }: { params: { key: string } }) {
  const cookies = req.headers.get("cookie") || "";
  const unlocked = /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies);
  if (!unlocked) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 });

  await ensureSchema()
  await sql`DELETE FROM settings WHERE key = ${params.key}`
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
