import { updateService, deleteService } from "@/lib/data"

function isUnlocked(req: Request) {
  const cookies = req.headers.get("cookie") || ""
  return /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })
  const body = await req.json().catch(() => ({}))
  await updateService(params.id, body)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })
  await deleteService(params.id)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
