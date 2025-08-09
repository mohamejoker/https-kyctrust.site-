"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FeatureIcon } from "@/components/icons"
import { paletteGrad } from "@/lib/palette"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import type { Bundle } from "@/lib/types"

export function FeaturesBlock({ data, isRTL, palette }: { data: Bundle; isRTL: boolean; palette: ReturnType<typeof paletteGrad> }) {
  const { design } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  return (
    <section className="relative px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          {enable ? (
            <ScrollReveal y={18 * k}>
              <h2 className="text-3xl font-extrabold md:text-5xl">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                  {isRTL ? "لماذا تختارنا؟" : "Why Choose Us?"}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                {isRTL ? "نقدم أفضل الخدمات المالية الرقمية بمعايير عالمية وتقنيات متطورة" : "We provide the best digital financial services with global standards and advanced technology"}
              </p>
            </ScrollReveal>
          ) : (
            <div>
              <h2 className="text-3xl font-extrabold md:text-5xl">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>
                  {isRTL ? "لماذا تختارنا؟" : "Why Choose Us?"}
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                {isRTL ? "نقدم أفضل الخدمات المالية الرقمية بمعايير عالمية وتقنيات متطورة" : "We provide the best digital financial services with global standards and advanced technology"}
              </p>
            </div>
          )}
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {data.features.map((f, i) => (
            enable ? (
              <ScrollReveal key={i} y={16 * k} delay={i * 0.05}>
                <Card className="group border-neutral-200/60 bg-white/70 transition-transform hover:-translate-y-1 hover:shadow-xl backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
                  <CardContent className="p-6">
                    <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${palette.range} text-white shadow`}>
                      <FeatureIcon name={f.icon} className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ) : (
              <Card key={i} className="group border-neutral-200/60 bg-white/70 transition-transform hover:-translate-y-1 hover:shadow-xl backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
                <CardContent className="p-6">
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${palette.range} text-white shadow`}>
                    <FeatureIcon name={f.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>
    </section>
  )
}
