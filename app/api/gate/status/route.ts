import { cookies } from "next/headers"

export async function GET() {
  const cookieStore = cookies()
  const unlocked = cookieStore.get("dash_unlock")?.value === "1"
  return new Response(JSON.stringify({ unlocked }), { status: 200 })
}
