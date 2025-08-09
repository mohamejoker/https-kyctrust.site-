import { moderateReview } from "@/lib/data"

function isUnlocked(req: Request) {
  const cookies = req.headers.get("cookie") || ""
  return /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })
  const { status } = await req.json().catch(() => ({}))
  if (!["approved", "rejected"].includes(status)) {
    return new Response(JSON.stringify({ error: "Bad status" }), { status: 400 })
  }
  await moderateReview(params.id, status)
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
