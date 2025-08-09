import { listAllReviews } from "@/lib/data"

function isUnlocked(req: Request) {
  const cookies = req.headers.get("cookie") || ""
  return /(?:^|; )dash_unlock=1(?:;|$)/.test(cookies)
}

export async function GET(req: Request) {
  if (!isUnlocked(req)) return new Response(JSON.stringify({ error: "Locked" }), { status: 401 })
  const rows = await listAllReviews(200)
  return new Response(JSON.stringify(rows), { status: 200, headers: { "Cache-Control": "no-store" } })
}
