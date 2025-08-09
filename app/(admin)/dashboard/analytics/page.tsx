"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SimpleLineChart } from "@/components/dashboard/charts"
import { Loader2, RefreshCcw } from 'lucide-react'

type AnalyticsRow = { day: string; visitors: number; leads: number; orders: number; conversion_rate: string }

export default function AnalyticsPage() {
  const [rows, setRows] = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [regenPending, setRegenPending] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/analytics")
      const j = (await r.json()) as AnalyticsRow[]
      setRows(Array.isArray(j) ? j : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const regen = async () => {
    setRegenPending(true)
    try {
      await fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: 14 }) })
      await load()
    } finally {
      setRegenPending(false)
    }
  }

  const series = rows.map((r) => ({ t: r.day.slice(5), v: r.visitors }))

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daily Visitors</CardTitle>
          <Button size="sm" onClick={regen} disabled={regenPending}>
            {regenPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Regenerate
          </Button>
        </CardHeader>
        <CardContent>{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : <SimpleLineChart data={series} height={180} />}</CardContent>
      </Card>
    </div>
  )
}
