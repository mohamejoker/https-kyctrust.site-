"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Bundle } from "@/lib/types"
import { paletteGrad } from "@/lib/palette"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"

export function CtaBlock({ data, isRTL, palette }: { data: Bundle; isRTL: boolean; palette: ReturnType<typeof paletteGrad> }) {
  const { design } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  if (!data.cta) return null

  const content = (
    <Card className="overflow-hidden border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
      <CardContent className="relative p-10 md:p-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-600/10 to-emerald-600/10" />
        <div className="relative z-10 text-center">
          <h3 className="text-3xl font-extrabold md:text-4xl">
            <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
              {data.cta.title}
            </span>
          </h3>
          {data.cta.subtitle ? (
            <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">{data.cta.subtitle}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button className={`min-w-[200px] bg-gradient-to-r ${palette.range} text-white`} size="lg">
              {data.cta.primaryText}
            </Button>
            {data.cta.secondaryText ? (
              <Button variant="outline" size="lg" className="min-w-[200px]">
                {data.cta.secondaryText}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <section className="relative px-4 py-16">
      <div className="mx-auto max-w-5xl">
        {enable ? <ScrollReveal y={18 * k}>{content}</ScrollReveal> : content}
      </div>
    </section>
  )
}
