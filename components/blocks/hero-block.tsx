"use client"

import Image from "next/image"
import { ArrowLeft, ArrowRight, Globe, MessageCircle, Moon, Shield, Sparkles, Sun } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Bundle, Locale } from "@/lib/types"
import { paletteGrad } from "@/lib/palette"
import { useCMS } from "@/lib/store"
import { useTheme } from "next-themes"
import { useParallax, useInViewOnce } from "@/hooks/use-parallax"
import { motion, useReducedMotion } from "framer-motion"

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

export function HeroBlock({
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
  const { setLocale, design } = useCMS()
  const { theme, setTheme } = useTheme()
  const parallax = useParallax(design.anim?.parallax ?? 14)

  return (
    <section
      className="relative px-4 pt-16 pb-12 md:pt-24"
      ref={parallax.ref as any}
      onPointerMove={parallax.onMove as any}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-32 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-48 -left-32 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl animate-pulse [animation-delay:600ms]" />
      </div>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${palette.range} text-white shadow-lg`}
              style={parallax.styleFor(0.2)}
            >
              {data.site.logoSrc ? (
                <Image
                  src={data.site.logoSrc || "/placeholder.svg"}
                  alt={`${data.site.name} logo`}
                  width={44}
                  height={44}
                  className="h-11 w-11 object-contain"
                  priority
                />
              ) : (
                <Shield className="h-6 w-6" aria-label="Brand logo" />
              )}
            </div>
            <div>
              <p
                className={`text-lg font-bold bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}
              >
                {data.site.name}
              </p>
              <p className="text-xs text-muted-foreground">{data.site.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            >
              <Globe className="me-2 h-4 w-4" />
              {locale === "ar" ? "English" : "عربي"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-background/60 p-8 shadow-sm backdrop-blur dark:border-neutral-800/60">
          <DecorativeLogos data={data} palette={palette} />
          <div className="relative z-10 text-center">
            <div className="mb-6 flex justify-center">
              <span
                className={`rounded-full bg-gradient-to-r ${palette.range} px-4 py-1.5 text-white shadow`}
                style={parallax.styleFor(0.1)}
              >
                {isRTL ? "حلول مالية رقمية موثوقة" : "Trusted Digital Financial Solutions"}
              </span>
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl">
              <span
                className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}
              >
                {data.hero.title}
              </span>
            </h1>
            <p className="mt-4 text-2xl text-muted-foreground">{data.hero.subtitle}</p>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {data.hero.description}
            </p>

            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                className={`group min-w-[260px] bg-gradient-to-r ${palette.range} text-white`}
                size="lg"
                onClick={() =>
                  window.open(
                    buildWhatsApp(isRTL ? "استفسار عام" : "General Inquiry", "N/A", locale, data.site.name),
                    "_blank"
                  )
                }
              >
                <MessageCircle className="h-5 w-5 me-2" />
                {data.hero.cta}
                {isRTL ? (
                  <ArrowLeft className="ms-2 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                ) : (
                  <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-w-[260px]"
                onClick={() =>
                  document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <Sparkles className="h-5 w-5 me-2" />
                {data.hero.secondary}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
          {data.hero.stats.map((s, i) => (
            <Card
              key={i}
              className="border-neutral-200/60 bg-white/70 backdrop-blur transition-transform hover:-translate-y-1 hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900/50"
            >
              <CardContent className="p-6 text-center">
                <p
                  className={`text-3xl font-extrabold bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}
                >
                  {s.number}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function DecorativeLogos({
  data,
  palette,
}: {
  data: Bundle
  palette: ReturnType<typeof paletteGrad>
}) {
  // Guard against undefined arrays in persisted states
  const logos = Array.isArray(data.logos) ? data.logos.slice(0, 6) : []
  if (!logos.length) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0">
        {logos.map((l, i) => (
          <FloatingLogo key={`${l.name}-${i}`} idx={i} src={l.src} name={l.name} palette={palette} />
        ))}
      </div>
    </div>
  )
}

function FloatingLogo({
  idx,
  src,
  name,
  palette,
}: {
  idx: number
  src: string
  name: string
  palette: ReturnType<typeof paletteGrad>
}) {
  const positions = [
    { top: "8%", left: "6%" },
    { top: "12%", right: "8%" },
    { bottom: "12%", left: "12%" },
    { bottom: "10%", right: "14%" },
    { top: "40%", left: "4%" },
    { top: "45%", right: "6%" },
  ] as const
  const { ref, entered } = useInViewOnce(0.2)
  const pos = positions[idx % positions.length]
  const prefersReduced = useReducedMotion()

  return (
    <motion.div
      ref={ref as any}
      className="absolute hidden sm:block rounded-xl bg-white/60 p-2 shadow backdrop-blur dark:bg-neutral-900/60"
      style={{
        ...pos,
        willChange: "transform, opacity",
      }}
      initial={{ opacity: 0, y: prefersReduced ? 0 : 8, scale: prefersReduced ? 1 : 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 24,
        delay: prefersReduced ? 0 : idx * 0.05,
      }}
    >
      <div className="rounded-lg px-2 py-1 ring-1 ring-black/5 dark:ring-white/5">
        <Image
          src={src || "/placeholder.svg?height=24&width=80&query=brand%20logo"}
          alt={`${name} logo`}
          width={96}
          height={24}
          sizes="(max-width: 640px) 96px, 96px"
          className="h-6 w-auto contrast-125 grayscale"
        />
      </div>
    </motion.div>
  )
}
