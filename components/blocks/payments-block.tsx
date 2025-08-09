"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { paletteGrad } from "@/lib/palette"
import type { Bundle } from "@/lib/types"
import { Check, Copy } from 'lucide-react'
import { useState } from "react"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }
  return (
    <Button variant="ghost" size="icon" onClick={onCopy} aria-label={copied ? "Copied" : "Copy"}>
      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}

export function PaymentsBlock({ data, isRTL, palette }: { data: Bundle; isRTL: boolean; palette: ReturnType<typeof paletteGrad> }) {
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
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{isRTL ? "طرق الدفع الآمنة" : "Secure Payment Methods"}</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                {isRTL ? "ندعم أحدث طرق الدفع الآمنة والسريعة" : "We support the latest secure and fast payment methods"}
              </p>
            </ScrollReveal>
          ) : (
            <div>
              <h2 className="text-3xl font-extrabold md:text-5xl">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{isRTL ? "طرق الدفع الآمنة" : "Secure Payment Methods"}</span>
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                {isRTL ? "ندعم أحدث طرق الدفع الآمنة والسريعة" : "We support the latest secure and fast payment methods"}
              </p>
            </div>
          )}
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {data.payments.map((p, i) => (
            enable ? (
              <ScrollReveal key={i} y={16 * k} delay={i * 0.06}>
                <Card className="border-neutral-200/60 bg-white/70 backdrop-blur hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={["grid h-11 w-11 place-items-center rounded-xl text-xl text-white shadow", p.color === "red" ? "bg-gradient-to-br from-rose-600 to-rose-500" : "bg-gradient-to-br from-emerald-600 to-emerald-500"].join(" ")}>
                          <span>{p.icon}</span>
                        </div>
                        <div>
                          <p className="text-base font-semibold">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{isRTL ? "متاح على مدار الساعة" : "24/7 Available"}</p>
                        </div>
                      </div>
                      <CopyField value={p.value} />
                    </div>
                    <div className="rounded-xl bg-neutral-50 p-3 font-mono text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                      <p className="break-all text-center">{p.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ) : (
              <Card key={i} className="border-neutral-200/60 bg-white/70 backdrop-blur hover:shadow-xl dark:border-neutral-800/60 dark:bg-neutral-900/50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={["grid h-11 w-11 place-items-center rounded-xl text-xl text-white shadow", p.color === "red" ? "bg-gradient-to-br from-rose-600 to-rose-500" : "bg-gradient-to-br from-emerald-600 to-emerald-500"].join(" ")}>
                        <span>{p.icon}</span>
                      </div>
                      <div>
                        <p className="text-base font-semibold">{p.label}</p>
                        <p className="text-xs text-muted-foreground">{isRTL ? "متاح على مدار الساعة" : "24/7 Available"}</p>
                      </div>
                    </div>
                    <CopyField value={p.value} />
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-3 font-mono text-sm text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
                    <p className="break-all text-center">{p.value}</p>
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>
    </section>
  )
}
