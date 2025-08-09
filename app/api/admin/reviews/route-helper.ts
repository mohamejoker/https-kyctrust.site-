import { ensureReviewsSchema } from "./schema-helper"

export async function GET() {
  await ensureReviewsSchema()
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
