"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { Bundle } from "@/lib/types"
import { paletteGrad } from "@/lib/palette"
import { Sparkles, Quote } from 'lucide-react'
import { useInViewOnce } from "@/hooks/use-parallax"
import Image from "next/image"

export function TestimonialsBlock({ data, isRTL, palette }: { data: Bundle; isRTL: boolean; palette: ReturnType<typeof paletteGrad> }) {
  return (
    <section className="relative px-4 py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl relative">
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${palette.range} text-white`}>
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold md:text-5xl">
            <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
              {isRTL ? "ماذا يقول عملاؤنا" : "What Our Clients Say"}
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
            {isRTL ? "آراء حقيقية من مستخدمين سعُداء بخدماتنا" : "Real feedback from happy customers"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.testimonials.map((t, i) => (
            <TestiCard key={i} t={t} palette={palette} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TestiCard({ t, palette }: { t: Bundle["testimonials"][number]; palette: ReturnType<typeof paletteGrad> }) {
  const { ref, entered } = useInViewOnce(0.2)
  return (
    <Card
      ref={ref as any}
      className={[
        "relative border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50 transition-all",
        entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      ].join(" ")}
    >
      <CardContent className="p-6">
        <Quote className={`mb-3 h-5 w-5 text-transparent bg-clip-text bg-gradient-to-r ${palette.range}`} />
        <p className="text-sm leading-relaxed">{t.quote}</p>
        <div className="mt-4 flex items-center gap-3">
          <Image
            src={t.avatar || "/placeholder.svg?height=40&width=40&query=user%20avatar"}
            alt={t.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
