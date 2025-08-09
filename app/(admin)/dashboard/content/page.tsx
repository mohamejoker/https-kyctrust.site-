"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useCMS } from "@/lib/store"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteForm, HeroForm, ServicesForm, PaymentsForm, FAQForm, LogosForm, TestimonialsForm, CTAForm, ContactForm } from "@/components/editor/forms"
import Link from "next/link"
import { Upload, Download, Save } from 'lucide-react'
import { notifyPublished } from "@/lib/realtime"

export default function ContentManagerPage() {
  const { toast } = useToast()
  const cms = useCMS()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/content/published", { cache: "no-store" })
        if (!r.ok) return
        const j = await r.json()
        if (j && j.ar && j.en) {
          cms.setContent("ar", j.ar)
          cms.setContent("en", j.en)
          if (j.design) cms.setDesign(j.design)
        }
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exportJSON = () => {
    const data = JSON.stringify({ ar: cms.content.ar, en: cms.content.en, design: cms.design }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kyctrust-content.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File) => {
    try {
      const text = await file.text()
      const j = JSON.parse(text)
      if (!j.ar || !j.en) throw new Error("Missing ar/en")
      cms.setContent("ar", j.ar)
      cms.setContent("en", j.en)
      if (j.design) cms.setDesign(j.design)
      toast({ title: "Imported", description: "JSON imported into editor state." })
    } catch (e: any) {
      toast({ title: "Invalid JSON", description: e?.message || "Could not parse file." })
    }
  }

  const publish = async () => {
    try {
      const r = await fetch("/api/content/published", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ar: cms.content.ar, en: cms.content.en, design: cms.design }),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        throw new Error(j.error || "Publish failed")
      }
      await fetch("/api/content/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "ar", content: cms.content.ar }),
      }).catch(() => {})
      await fetch("/api/content/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: "en", content: cms.content.en }),
      }).catch(() => {})
      notifyPublished()
      toast({ title: "Published", description: "Landing content has been published and broadcast." })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not publish content." })
    }
  }

  if (loading) return <div className="p-4 text-sm text-muted-foreground">Loading published content…</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Content Manager</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportJSON}>
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Import JSON
            </Button>
            <Link href="/dashboard/content/json" className="inline-flex items-center rounded-md border px-3 py-2 text-sm">
              Open JSON Editor
            </Link>
            <Button onClick={publish}>
              <Save className="mr-2 h-4 w-4" /> Publish
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="site" className="space-y-4">
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="site">Site</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="cta">CTA</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          <Card><CardContent className="p-4"><SiteForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="hero">
          <Card><CardContent className="p-4"><HeroForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="services">
          <Card><CardContent className="p-4"><ServicesForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card><CardContent className="p-4"><PaymentsForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="faq">
          <Card><CardContent className="p-4"><FAQForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="logos">
          <Card><CardContent className="p-4"><LogosForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="testimonials">
          <Card><CardContent className="p-4"><TestimonialsForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="cta">
          <Card><CardContent className="p-4"><CTAForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
        <TabsContent value="contact">
          <Card><CardContent className="p-4"><ContactForm locale={cms.locale} /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
