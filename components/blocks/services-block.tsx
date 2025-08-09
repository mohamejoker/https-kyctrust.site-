"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { paletteGrad } from "@/lib/palette"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import type { Bundle, Locale } from "@/lib/types"
import { Filter, MessageCircle, Search, Star } from 'lucide-react'
import { useMemo, useState } from "react"

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

function normalizeName(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")
}

export function ServicesBlock({
  data,
  locale,
  isRTL,
  palette,
}: {
  data: Bundle
  locale: Locale
  isRTL: boolean
  palette: ReturnType<typeof paletteGrad>
}) {
  const [category, setCategory] = useState<string>("all")
  const [q, setQ] = useState<string>("")
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(data.services.map((s) => s.category)))],
    [data.services]
  )
  const services = useMemo(
    () =>
      data.services
        .filter((s) => s.active !== false)
        .filter((s) => (category === "all" ? true : s.category === category))
        .filter((s) => (q.trim() ? s.name.toLowerCase().includes(q.toLowerCase()) : true))
        .sort((a, b) => a.sort - b.sort),
    [data.services, category, q]
  )
  const logos = Array.isArray(data.logos) ? data.logos : []
  const { design } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  return (
    <section
      id="services"
      className="relative bg-gradient-to-b from-white to-emerald-50/40 px-4 py-16 dark:from-neutral-950 dark:to-neutral-950"
    >
      <div className="mx-auto max-w-7xl">
        {enable ? (
          <ScrollReveal y={18 * k}>
            <div className="text-center">
              <h2 className="text-3xl font-extrabold md:text-5xl">
                <span
                  className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}
                >
                  {isRTL ? "خدماتنا المتميزة" : "Our Premium Services"}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                {isRTL
                  ? "اختر من مجموعة واسعة من الخدمات المالية المتطورة"
                  : "Choose from a wide range of advanced financial services"}
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-extrabold md:text-5xl">
              <span
                className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}
              >
                {isRTL ? "خدماتنا المتميزة" : "Our Premium Services"}
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              {isRTL
                ? "اختر من مجموعة واسعة من الخدمات المالية المتطورة"
                : "Choose from a wide range of advanced financial services"}
            </p>
          </div>
        )}

        <div className="mx-auto mt-8 flex max-w-4xl flex-col items-stretch gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60 rtl:right-3 rtl:left-auto" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isRTL ? "ابحث عن الخدمة..." : "Search services..."}
              className="ps-9 pe-3 py-6 rounded-xl"
              aria-label={isRTL ? "بحث في الخدمات" : "Search services"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => {
              const active = category === c
              return (
                <Button
                  key={c}
                  variant={active ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                  className={active ? `bg-gradient-to-r ${palette.range} text-white` : ""}
                >
                  <Filter className="h-4 w-4 me-2" />
                  {c === "all" ? (isRTL ? "الكل" : "All") : c}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((s, i) => {
            const matched = logos.find((l) => normalizeName(l.name) === normalizeName(s.name))
            const iconSrc = s.iconImage || matched?.src
            const hasRealIcon = Boolean(iconSrc)
            return (
              enable ? (
                <ScrollReveal key={`${s.name}-${i}`} y={16 * k} delay={i * 0.05}>
                  <Card
                    className="group border-neutral-200/60 bg-white/70 backdrop-blur transition-transform hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900/50"
                  >
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${palette.range} text-white shadow`}
                            aria-hidden={!hasRealIcon}
                          >
                            {iconSrc ? (
                              <Image
                                src={iconSrc || "/placeholder.svg"}
                                alt={`${s.name} logo`}
                                width={44}
                                height={44}
                                sizes="(max-width: 768px) 44px, 44px"
                                className="h-11 w-11 object-contain"
                                priority={false}
                              />
                            ) : (
                              <span className="text-xl leading-none" aria-label={`${s.name} icon`}>
                                {s.icon}
                              </span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{s.name}</h3>
                            <p className="text-xs text-muted-foreground">{s.category}</p>
                          </div>
                        </div>

                        <div className="text-end">
                          <p
                            className={`bg-gradient-to-r ${palette.range} bg-clip-text text-2xl font-extrabold text-transparent`}
                          >
                            {s.price}
                          </p>
                          {s.note ? <p className="mt-1 text-xs text-muted-foreground">{s.note}</p> : null}
                        </div>
                      </div>

                      {s.popular ? (
                        <Badge className="mb-2 rounded-full bg-amber-500 text-white hover:bg-amber-500">
                          <Star className="me-1 h-3.5 w-3.5" />
                          {isRTL ? "الأكثر طلباً" : "Popular"}
                        </Badge>
                      ) : null}

                      <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>

                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="rounded-full">
                          {s.category}
                        </Badge>
                        <Button
                          className={`bg-gradient-to-r ${palette.range} text-white`}
                          onClick={() => window.open(buildWhatsApp(s.name, s.price, locale, data.site.name), "_blank")}
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4 me-2" />
                          {isRTL ? "اطلب الآن" : "Order Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ) : (
                <Card
                  key={`${s.name}-${i}`}
                  className="group border-neutral-200/60 bg-white/70 backdrop-blur transition-transform hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900/50"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${palette.range} text-white shadow`}
                          aria-hidden={!hasRealIcon}
                        >
                          {iconSrc ? (
                            <Image
                              src={iconSrc || "/placeholder.svg"}
                              alt={`${s.name} logo`}
                              width={44}
                              height={44}
                              sizes="(max-width: 768px) 44px, 44px"
                              className="h-11 w-11 object-contain"
                              priority={false}
                            />
                          ) : (
                            <span className="text-xl leading-none" aria-label={`${s.name} icon`}>
                              {s.icon}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{s.name}</h3>
                          <p className="text-xs text-muted-foreground">{s.category}</p>
                        </div>
                      </div>

                      <div className="text-end">
                        <p
                          className={`bg-gradient-to-r ${palette.range} bg-clip-text text-2xl font-extrabold text-transparent`}
                        >
                          {s.price}
                        </p>
                        {s.note ? <p className="mt-1 text-xs text-muted-foreground">{s.note}</p> : null}
                      </div>
                    </div>

                    {s.popular ? (
                      <Badge className="mb-2 rounded-full bg-amber-500 text-white hover:bg-amber-500">
                        <Star className="me-1 h-3.5 w-3.5" />
                        {isRTL ? "الأكثر طلباً" : "Popular"}
                      </Badge>
                    ) : null}

                    <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{s.description}</p>

                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="rounded-full">
                        {s.category}
                      </Badge>
                      <Button
                        className={`bg-gradient-to-r ${palette.range} text-white`}
                        onClick={() => window.open(buildWhatsApp(s.name, s.price, locale, data.site.name), "_blank")}
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 me-2" />
                        {isRTL ? "اطلب الآن" : "Order Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            )
          })}
        </div>
      </div>
    </section>
  )
}
