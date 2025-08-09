import { ensureSchema } from "@/lib/schema"
import { sql } from "@/lib/db"

export async function GET() {
  await ensureSchema()
  const rows = await sql<{ day: string; visitors: number; leads: number; orders: number; conversion_rate: string }[]>
  `SELECT day, visitors, leads, orders, conversion_rate FROM analytics_daily ORDER BY day ASC`
  return new Response(JSON.stringify(rows), { status: 200 })
}

export async function POST(req: Request) {
  await ensureSchema()
  const { days = 14 } = await req.json().catch(() => ({ days: 14 }))
  const today = new Date()
  // regenerate last N days
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const day = d.toISOString().slice(0, 10)
    const visitors = Math.round(400 + Math.random() * 600)
    const leads = Math.round(visitors * (0.04 + Math.random() * 0.03))
    const orders = Math.round(leads * (0.35 + Math.random() * 0.15))
    const conv = ((orders / visitors) * 100).toFixed(2)
    await sql`
      INSERT INTO analytics_daily (day, visitors, leads, orders, conversion_rate)
      VALUES (${day}, ${visitors}, ${leads}, ${orders}, ${conv})
      ON CONFLICT (day) DO UPDATE SET visitors = EXCLUDED.visitors, leads = EXCLUDED.leads, orders = EXCLUDED.orders, conversion_rate = EXCLUDED.conversion_rate
    `
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
