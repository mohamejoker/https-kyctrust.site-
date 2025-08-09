"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Bundle, Locale } from "@/lib/types"
import { paletteGrad } from "@/lib/palette"
import { CheckCircle2, ChevronRight, MessageCircle, Phone } from 'lucide-react'
import { useState } from "react"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"

function buildWhatsApp(service: string, price: string, locale: Locale = "ar", brand = "kyctrust") {
  const phone = "201062453344"
  const timestamp = Date.now()
  const requestId = `LP-${timestamp}`
  const messages: Record<Locale, string> = {
    ar: `🔥 طلب خدمة من ${brand}

📋 تفاصيل الطلب:
• الخدمة: ${service}
• السعر: ${price}
• اللغة: ${locale}
• معرف الطلب: ${requestId}

⏰ سنرد عليك خلال 15 دقيقة
🛡️ خدمة آمنة ومضمونة 100%`,
    en: `🔥 Service Request from ${brand}

📋 Order Details:
• Service: ${service}
• Price: ${price}
• Language: ${locale}
• Request ID: ${requestId}

⏰ We'll reply within 15 minutes
🛡️ 100% Safe and Guaranteed Service`,
  }
  const text = encodeURIComponent(messages[locale] || messages.ar)
  return `https://wa.me/${phone}?text=${text}`
}

export function ContactBlock({ data, locale, palette }: { data: Bundle; locale: Locale; palette: ReturnType<typeof paletteGrad> }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const { design } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  const submit = async () => {
    if (!form.name || !form.email || !form.message) {
      toast({ title: locale === "ar" ? "تحقق من الحقول" : "Check fields", description: locale === "ar" ? "الاسم والبريد والرسالة مطلوبة." : "Name, email, and message are required." })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      const json = await res.json()
      toast({ title: json.success ? (locale === "ar" ? "تم الإرسال" : "Sent") : (locale === "ar" ? "حدث خطأ" : "Error"), description: json.message })
      if (json.success) setForm({ name: "", email: "", message: "" })
    } catch {
      toast({ title: locale === "ar" ? "حدث خطأ" : "Error", description: locale === "ar" ? "تعذر إرسال الطلب الآن." : "Could not send your request now." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {enable ? (
          <ScrollReveal y={20 * k}>
            <Card className="overflow-hidden border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <CardContent className="relative p-10 md:p-14">
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/10 to-emerald-600/10" />
                <div className="relative z-10 grid gap-10 md:grid-cols-2">
                  <div className="text-center md:text-start">
                    <div className={`mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${palette.range} text-white shadow`}>
                      <MessageCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-3xl font-extrabold md:text-4xl">
                      <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{data.contact.title}</span>
                    </h3>
                    <p className="mt-3 max-w-xl text-lg text-muted-foreground">{data.contact.subtitle}</p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {data.contact.features.map((t, i) => (
                        <span key={i} className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-4 py-2 text-sm text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8">
                      <Button
                        size="lg"
                        className={`min-w-[280px] bg-gradient-to-r ${palette.range} text-white`}
                        onClick={() => window.open(buildWhatsApp("General Inquiry", "N/A", locale, data.site.name), "_blank")}
                      >
                        <MessageCircle className="h-5 w-5 me-2" />
                        {data.contact.whatsapp}
                        <ChevronRight className="ms-2 h-4 w-4" />
                      </Button>
                      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span className="font-mono">{data.site.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="name">{locale === "ar" ? "الاسم" : "Name"}</Label>
                      <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={locale === "ar" ? "اكتب اسمك" : "Your name"} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message">{locale === "ar" ? "رسالتك" : "Message"}</Label>
                        <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={locale === "ar" ? "اكتب رسالتك هنا..." : "Write your message..."} />
                      </div>
                      <Button onClick={submit} disabled={loading} className={`bg-gradient-to-r ${palette.range} text-white`}>
                        {loading ? (locale === "ar" ? "جارٍ الإرسال..." : "Sending...") : (locale === "ar" ? "إرسال" : "Send")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        ) : (
          <Card className="overflow-hidden border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
            <CardContent className="relative p-10 md:p-14">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/10 to-emerald-600/10" />
              <div className="relative z-10 grid gap-10 md:grid-cols-2">
                <div className="text-center md:text-start">
                  <div className={`mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${palette.range} text-white shadow`}>
                    <MessageCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-3xl font-extrabold md:text-4xl">
                    <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{data.contact.title}</span>
                  </h3>
                  <p className="mt-3 max-w-xl text-lg text-muted-foreground">{data.contact.subtitle}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {data.contact.features.map((t, i) => (
                      <span key={i} className="inline-flex items-center gap-2 rounded-full bg-neutral-50 px-4 py-2 text-sm text-neutral-700 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-8">
                    <Button
                      size="lg"
                      className={`min-w-[280px] bg-gradient-to-r ${palette.range} text-white`}
                      onClick={() => window.open(buildWhatsApp("General Inquiry", "N/A", locale, data.site.name), "_blank")}
                    >
                      <MessageCircle className="h-5 w-5 me-2" />
                      {data.contact.whatsapp}
                      <ChevronRight className="ms-2 h-4 w-4" />
                    </Button>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span className="font-mono">{data.site.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="name">{locale === "ar" ? "الاسم" : "Name"}</Label>
                      <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={locale === "ar" ? "اكتب اسمك" : "Your name"} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">{locale === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">{locale === "ar" ? "رسالتك" : "Message"}</Label>
                      <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder={locale === "ar" ? "اكتب رسالتك هنا..." : "Write your message..."} />
                    </div>
                    <Button onClick={submit} disabled={loading} className={`bg-gradient-to-r ${palette.range} text-white`}>
                      {loading ? (locale === "ar" ? "جارٍ الإرسال..." : "Sending...") : (locale === "ar" ? "إرسال" : "Send")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
