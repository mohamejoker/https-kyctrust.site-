import { listPublicServices } from "@/lib/data"

export async function GET() {
  const rows = await listPublicServices()
  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  })
}
