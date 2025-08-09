"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from 'lucide-react'

export default function DBSettingsEditor() {
  const [key, setKey] = useState("published_content")
  const [json, setJson] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setBusy(true); setMsg(null)
    try {
      const r = await fetch(`/api/settings/${encodeURIComponent(key)}`)
      const j = await r.json()
      setJson(JSON.stringify(j ?? null, null, 2))
      setMsg("Loaded")
    } catch {
      setMsg("Load failed")
    } finally {
      setBusy(false)
    }
  }

  const save = async () => {
    setBusy(true); setMsg(null)
    try {
      const parsed = JSON.parse(json)
      const r = await fetch(`/api/settings/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      if (!r.ok) throw new Error()
      setMsg("Saved")
    } catch {
      setMsg("Invalid JSON or save failed")
    } finally {
      setBusy(false)
    }
  }

  const del = async () => {
    setBusy(true); setMsg(null)
    try {
      const r = await fetch(`/api/settings/${encodeURIComponent(key)}`, { method: "DELETE" })
      if (!r.ok) throw new Error()
      setMsg("Deleted")
      setJson("")
    } catch {
      setMsg("Delete failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>DB Settings Editor</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>Load</Button>
          <Button onClick={save} disabled={busy}>Save</Button>
          <Button variant="destructive" onClick={del} disabled={busy} className="gap-2">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Input placeholder="settings key (e.g. published_content)" value={key} onChange={(e) => setKey(e.target.value)} />
        <Textarea className="min-h-[50vh] font-mono" placeholder="JSON value" value={json} onChange={(e) => setJson(e.target.value)} />
        {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
      </CardContent>
    </Card>
  )
}
