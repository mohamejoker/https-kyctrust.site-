"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Stars, StarsInput } from "./star-rating"
import { Loader2, MessageCircle } from "lucide-react"
import { paletteGrad } from "@/lib/palette"
import { useCMS } from "@/lib/store"

type Review = { id: string; name: string; rating: number; comment: string; created_at: string }

export function ReviewsSection() {
  const { locale, design } = useCMS()
  const { toast } = useToast()
  const palette = paletteGrad(design.palette)
  const [items, setItems] = useState<Review[]>([])
  const [summary, setSummary] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", rating: 5, comment: "", website: "" }) // website: honeypot

  const t = useMemo(
    () => ({
      title: locale === "ar" ? "آراء المستخدمين" : "User Reviews",
      subtitle:
        locale === "ar" ? "شارك رأيك وساعد الآخرين على اتخاذ القرار" : "Share your experience and help others decide",
      submit: locale === "ar" ? "إرسال التقييم" : "Submit Review",
      pending: locale === "ar" ? "تم الإستلام، قيد المراجعة." : "Received. Pending moderation.",
    }),
    [locale],
  )

  async function load(p = 1) {
    setLoading(true)
    try {
      const r = await fetch(`/api/reviews?page=${p}&pageSize=8`, { cache: "no-store" })
      if (!r.ok) throw new Error("Failed")
      const j = await r.json()
      setItems(j.items || [])
      setSummary(j.summary || { avg: 0, count: 0 })
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page)
  }, [page])

  const submit = async () => {
    if (!form.name || !form.comment || !form.rating) {
      toast({
        title: locale === "ar" ? "تحقق من الحقول" : "Check fields",
        description: locale === "ar" ? "الاسم والتعليق مطلوبان." : "Name and comment are required.",
      })
      return
    }
    setSubmitting(true)
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || "Failed")
      toast({ title: "OK", description: t.pending })
      setForm({ name: "", email: "", rating: 5, comment: "", website: "" })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not submit" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="relative px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{t.title}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Summary */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {locale === "ar" ? "متوسط التقييم" : "Average rating"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <div className="text-4xl font-extrabold">{summary.avg.toFixed(2)}</div>
              <Stars value={summary.avg} size={18} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {locale === "ar" ? "عدد التقييمات" : "Total reviews"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-4xl font-extrabold">{summary.count.toLocaleString()}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {locale === "ar" ? "شارك رأيك" : "Share your review"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className={`w-full bg-gradient-to-r ${palette.range} text-white`}
                onClick={() => document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t.submit}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="space-y-3 p-4">
                  <div className="h-4 w-1/2 rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
                  <div className="h-3 w-2/3 rounded bg-muted" />
                </CardContent>
              </Card>
            ))
          ) : items.length === 0 ? (
            <div className="col-span-2 text-center text-sm text-muted-foreground">
              {locale === "ar" ? "لا توجد تقييمات بعد." : "No reviews yet."}
            </div>
          ) : (
            items.map((r) => (
              <Card
                key={r.id}
                className="border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{r.name}</div>
                    <Stars value={r.rating} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  <div className="mt-2 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination (simple) */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            {locale === "ar" ? "السابق" : "Prev"}
          </Button>
          <div className="text-sm text-muted-foreground">Page {page}</div>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            {locale === "ar" ? "التالي" : "Next"}
          </Button>
        </div>

        {/* Form */}
        <div id="review-form" className="mx-auto mt-10 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>{t.submit}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <Label>{locale === "ar" ? "الاسم" : "Name"}</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={locale === "ar" ? "اسمك" : "Your name"}
                />
              </div>
              <div className="grid gap-2">
                <Label>{locale === "ar" ? "البريد (اختياري)" : "Email (optional)"}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                />
              </div>
              {/* Honeypot (hidden from users) */}
              <input
                aria-hidden
                tabIndex={-1}
                autoComplete="off"
                name="website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                className="hidden"
              />
              <div className="grid gap-2">
                <Label>{locale === "ar" ? "التقييم" : "Rating"}</Label>
                <StarsInput value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
              </div>
              <div className="grid gap-2">
                <Label>{locale === "ar" ? "التعليق" : "Comment"}</Label>
                <Textarea
                  rows={4}
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder={locale === "ar" ? "اكتب رأيك هنا..." : "Write your review..."}
                />
              </div>
              <Button onClick={submit} disabled={submitting} className={`bg-gradient-to-r ${palette.range} text-white`}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {t.submit}
              </Button>
              <div className="text-xs text-muted-foreground">
                {locale === "ar"
                  ? "قد تتم مراجعة تقييمك من قبل الإدارة قبل النشر."
                  : "Your review may be moderated by admins before publishing."}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
