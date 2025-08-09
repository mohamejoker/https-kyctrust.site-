"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type Masked = {
  providers: {
    xaiKey: string
    groqKey: string
    deepinfraKey: string
  }
}

export default function SecretsSettingsPage() {
  const { toast } = useToast()
  const [masked, setMasked] = useState<Masked | null>(null)
  const [form, setForm] = useState<{ xaiKey?: string; groqKey?: string; deepinfraKey?: string }>({})
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setBusy(true)
    try {
      const r = await fetch("/api/admin/secrets", { cache: "no-store" })
      const j = await r.json()
      setMasked(j.masked || { providers: { xaiKey: "", groqKey: "", deepinfraKey: "" } })
      // Don't prefill secrets inputs; keep them empty (write-only UX)
      setForm({})
    } catch {
      setMasked({ providers: { xaiKey: "", groqKey: "", deepinfraKey: "" } })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    setBusy(true)
    try {
      const r = await fetch("/api/admin/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers: form }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || "Save failed")
      }
      toast({ title: "Saved", description: "Runtime secrets have been updated." })
      await load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not save secrets." })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Secrets (AI Providers)</CardTitle>
        <Button variant="outline" onClick={load} disabled={busy}>
          Reload
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Enter provider API keys. Leave blank to keep existing. Send an empty string to clear a key.
        </p>

        <div className="grid gap-2">
          <Label>xAI API Key (Grok)</Label>
          <Input
            type="password"
            placeholder={masked?.providers.xaiKey ? `Stored: ${masked.providers.xaiKey}` : "sk-..."}
            value={form.xaiKey ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, xaiKey: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label>Groq API Key</Label>
          <Input
            type="password"
            placeholder={masked?.providers.groqKey ? `Stored: ${masked.providers.groqKey}` : "gsk_..."}
            value={form.groqKey ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, groqKey: e.target.value }))}
          />
        </div>

        <div className="grid gap-2">
          <Label>DeepInfra API Key</Label>
          <Input
            type="password"
            placeholder={masked?.providers.deepinfraKey ? `Stored: ${masked.providers.deepinfraKey}` : "di_..."}
            value={form.deepinfraKey ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, deepinfraKey: e.target.value }))}
          />
        </div>

        <div className="pt-2">
          <Button onClick={save} disabled={busy}>
            Save Secrets
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Notes:
          <ul className="list-disc ps-5">
            <li>Keys are encrypted at rest using STACK_SECRET_SERVER_KEY on the server.</li>
            <li>The chatbot will prefer these keys over environment variables.</li>
            <li>Do not share keys publicly; these are never exposed to the browser.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
