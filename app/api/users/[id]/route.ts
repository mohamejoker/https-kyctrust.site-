import { updateUser as updateUserFn, deleteUser as deleteUserFn } from "@/lib/data"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}))
  const patch: Record<string, any> = {}
  const fields = ["name", "email", "role", "active"] as const
  for (const k of fields) if (k in body) patch[k] = body[k]
  if (!Object.keys(patch).length) return new Response(JSON.stringify({ error: "Nothing to update" }), { status: 400 })
  const updated = await updateUserFn({ id: params.id, ...patch })
  return new Response(JSON.stringify(updated), { status: 200 })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await deleteUserFn(params.id)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
