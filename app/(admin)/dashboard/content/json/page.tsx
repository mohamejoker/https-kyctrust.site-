"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function JSONEditorPage() {
  const { toast } = useToast()
  const [value, setValue] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/content/published")
        const j = await r.json()
        setValue(JSON.stringify(j ?? { ar: {}, en: {}, design: null }, null, 2))
      } catch {
        setValue(JSON.stringify({ ar: {}, en: {}, design: null }, null, 2))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const publish = async () => {
    try {
      const parsed = JSON.parse(value)
      if (!parsed.ar || !parsed.en) throw new Error("Missing ar/en")
      const r = await fetch("/api/content/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || "Publish failed")
      }
      toast({ title: "Published", description: "Updated published_content." })
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: e?.message || "Fix JSON then try again." })
    }
  }

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading…</div>

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>JSON Editor</CardTitle>
        <Button onClick={publish}>Validate & Publish</Button>
      </CardHeader>
      <CardContent>
        <Textarea className="min-h-[60vh] font-mono" value={value} onChange={(e) => setValue(e.target.value)} />
      </CardContent>
    </Card>
  )
}
