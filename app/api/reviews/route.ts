import { createReview, listApprovedReviews } from "@/lib/data"

// Public: list approved reviews with pagination
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10))
  const pageSize = Math.min(20, Math.max(1, Number.parseInt(searchParams.get("pageSize") || "10", 10)))

  const data = await listApprovedReviews(page, pageSize)
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Cache-Control": "public, max-age=30", "Content-Type": "application/json" },
  })
}

// Public: submit a review (pending moderation)
export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0] || "unknown"
  const ua = req.headers.get("user-agent") || "unknown"
  const body = await req.json().catch(() => ({}))
  const { name, email, rating, comment, website } = body as {
    name?: string
    email?: string
    rating?: number
    comment?: string
    website?: string
  }
  if (website && String(website).trim().length > 0) {
    return new Response(JSON.stringify({ error: "Spam detected" }), { status: 400 })
  }
  if (!name || !comment || !rating || rating < 1 || rating > 5) {
    return new Response(JSON.stringify({ error: "Missing or invalid fields" }), { status: 400 })
  }
  const id = await createReview({ name, email, rating, comment, ip, ua })
  return new Response(JSON.stringify({ ok: true, id, status: "pending" }), { status: 200 })
}
