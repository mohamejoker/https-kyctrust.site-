"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

type Row = {
  id: string
  name: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}

export default function ReviewsAdminPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/admin/reviews", { cache: "no-store" })
      const j = await r.json()
      setRows(Array.isArray(j) ? j : [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    setBusy(id)
    try {
      const r = await fetch(`/api/reviews/${id}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (r.ok) await load()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviews Moderation</CardTitle>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reload
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No reviews</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="p-2">Name</th>
                  <th className="p-2">Rating</th>
                  <th className="p-2">Comment</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="p-2">{r.name}</td>
                    <td className="p-2">{r.rating}</td>
                    <td className="p-2 max-w-[420px] truncate" title={r.comment}>
                      {r.comment}
                    </td>
                    <td className="p-2">
                      <Badge
                        variant={
                          r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    </td>
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setStatus(r.id, "approved")}
                          disabled={busy === r.id}
                        >
                          {busy === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setStatus(r.id, "rejected")}
                          disabled={busy === r.id}
                        >
                          {busy === r.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-600" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
