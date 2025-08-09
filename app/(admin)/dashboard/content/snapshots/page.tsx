"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, RefreshCcw, RotateCcw } from 'lucide-react'

type Snapshot = {
  id: string
  locale: "ar" | "en"
  content: any
  created_at: string
}

type Published = {
  ar: any
  en: any
  design?: any
  updatedAt?: string
}

export default function SnapshotsPage() {
  const { toast } = useToast()
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [locale, setLocale] = useState<"all" | "ar" | "en">("all")
  const [q, setQ] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/content/snapshots", { cache: "no-store" })
      const j = (await r.json()) as Snapshot[]
      setSnapshots(Array.isArray(j) ? j : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    let arr = snapshots.slice()
    if (locale !== "all") arr = arr.filter((s) => s.locale === locale)
    if (q.trim()) {
      const t = q.toLowerCase()
      arr = arr.filter((s) => JSON.stringify(s.content).toLowerCase().includes(t))
    }
    return arr
  }, [snapshots, locale, q])

  const restore = async (snap: Snapshot) => {
    setBusy(true)
    try {
      // Get currently published to merge the other locale + design
      const r = await fetch("/api/content/published", { cache: "no-store" })
      const pub = (await r.json()) as Published | null
      const next: Published = {
        ar: snap.locale === "ar" ? snap.content : pub?.ar || {},
        en: snap.locale === "en" ? snap.content : pub?.en || {},
        design: pub?.design || null,
      }

      const rr = await fetch("/api/content/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      })
      if (!rr.ok) {
        const jj = await rr.json().catch(() => ({}))
        throw new Error(jj.error || "Restore failed")
      }

      // Optionally add a new snapshot entry to keep track
      await fetch("/api/content/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: snap.locale, content: snap.content }),
      }).catch(() => {})

      toast({ title: "Restored", description: `Published content replaced from snapshot #${snap.id} (${snap.locale}).` })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not restore snapshot." })
    } finally {
      setBusy(false)
    }
  }

  const snapshotNow = async () => {
    setBusy(true)
    try {
      const r = await fetch("/api/content/published", { cache: "no-store" })
      const pub = (await r.json()) as Published | null
      if (!pub?.ar || !pub?.en) throw new Error("Nothing published to snapshot")

      await fetch("/api/content/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "ar", content: pub.ar }),
      })
      await fetch("/api/content/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "en", content: pub.en }),
      })
      toast({ title: "Snapshot created", description: "Saved current published content for both locales." })
      await load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not create snapshot." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search in snapshot JSON…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        <Select value={locale} onValueChange={(v: "all" | "ar" | "en") => setLocale(v)}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Locale" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="ar">ar</SelectItem>
            <SelectItem value="en">en</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={load} disabled={loading || busy}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          Reload
        </Button>
        <Button onClick={snapshotNow} disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
          Snapshot Now
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Snapshots</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No snapshots</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="p-2">ID</th>
                  <th className="p-2">Locale</th>
                  <th className="p-2">Created</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const size = new Blob([JSON.stringify(s.content)]).size
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="p-2">{s.id}</td>
                      <td className="p-2"><Badge variant="secondary">{s.locale}</Badge></td>
                      <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
                      <td className="p-2">{size.toLocaleString()} bytes</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <details>
                            <summary className="cursor-pointer text-primary">View JSON</summary>
                            <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(s.content, null, 2)}</pre>
                          </details>
                          <Button size="sm" onClick={() => restore(s)} disabled={busy}>Restore</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
