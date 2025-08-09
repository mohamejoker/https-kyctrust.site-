"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function InstallPage() {
  const { toast } = useToast()
  const [installed, setInstalled] = useState<boolean | null>(null)
  const [adminPassword, setAdminPassword] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [xaiKey, setXaiKey] = useState("")
  const [groqKey, setGroqKey] = useState("")
  const [deepinfraKey, setDeepinfraKey] = useState("")
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const r = await fetch("/api/install", { cache: "no-store" })
      const j = await r.json()
      setInstalled(Boolean(j.installed))
    } catch {
      setInstalled(true)
    }
  }
  useEffect(() => {
    load()
  }, [])

  const submit = async () => {
    setBusy(true)
    try {
      const r = await fetch("/api/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminPassword,
          siteUrl,
          providers: { xaiKey, groqKey, deepinfraKey },
        }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Install failed")
      toast({ title: "Installed", description: "Project initialized. You can open the dashboard now." })
      setInstalled(true)
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to install" })
    } finally {
      setBusy(false)
    }
  }

  if (installed === null) return <div className="p-6 text-sm text-muted-foreground">Checking installation…</div>
  if (installed)
    return (
      <div className="grid min-h-[70vh] place-items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Already installed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">You can access the dashboard:</p>
            <div>
              <Link href="/admin" className="text-primary underline">
                Open Admin
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )

  return (
    <div className="grid min-h-[70vh] place-items-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>First-time Setup</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label>Dashboard Password</Label>
            <Input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Choose a strong password"
            />
          </div>
          <div className="grid gap-2">
            <Label>Site URL</Label>
            <Input value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://kyctrust.site" />
            <p className="text-xs text-muted-foreground">Used in sitemaps, canonical links, and share metadata.</p>
          </div>
          <div className="grid gap-2">
            <Label>Optional: AI Provider Keys</Label>
            <Input
              type="password"
              value={xaiKey}
              onChange={(e) => setXaiKey(e.target.value)}
              placeholder="xAI (Grok) API Key"
            />
            <Input
              type="password"
              value={groqKey}
              onChange={(e) => setGroqKey(e.target.value)}
              placeholder="Groq API Key"
            />
            <Input
              type="password"
              value={deepinfraKey}
              onChange={(e) => setDeepinfraKey(e.target.value)}
              placeholder="DeepInfra API Key"
            />
            <p className="text-xs text-muted-foreground">
              Stored encrypted on the server. You can change later from Dashboard → Settings → Secrets.
            </p>
          </div>
          <Button onClick={submit} disabled={busy || !adminPassword} className="w-full">
            {busy ? "Installing…" : "Install"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
