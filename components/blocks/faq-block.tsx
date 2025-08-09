"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { paletteGrad } from "@/lib/palette"
import { ScrollReveal } from "@/components/animate/scroll-reveal"
import { useCMS } from "@/lib/store"
import type { Bundle } from "@/lib/types"

export function FAQBlock({ data, isRTL, palette }: { data: Bundle; isRTL: boolean; palette: ReturnType<typeof paletteGrad> }) {
  const { design } = useCMS()
  const enable = design.anim?.enableReveal !== false
  const k = design.anim?.intensity ?? 1

  return (
    <section id="faq" className="relative bg-gradient-to-b from-emerald-50/40 to-white px-4 py-16 dark:from-neutral-950 dark:to-neutral-950">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          {enable ? (
            <ScrollReveal y={18 * k}>
              <h2 className="text-3xl font-extrabold md:text-5xl">
                <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{isRTL ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</span>
              </h2>
            </ScrollReveal>
          ) : (
            <h2 className="text-3xl font-extrabold md:text-5xl">
              <span className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}>{isRTL ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</span>
            </h2>
          )}
          {enable ? (
            <ScrollReveal y={18 * k} delay={0.04}>
              <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
                {isRTL ? "إجابات على أهم الأسئلة التي قد تخطر ببالك" : "Answers to the most important questions you might have"}
              </p>
            </ScrollReveal>
          ) : (
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              {isRTL ? "إجابات على أهم الأسئلة التي قد تخطر ببالك" : "Answers to the most important questions you might have"}
            </p>
          )}
        </div>

        <div className="mx-auto mt-8 max-w-3xl">
          <Card className="border-neutral-200/60 bg-white/70 backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
            <CardContent className="p-2">
              <Accordion type="single" collapsible>
                {data.faq.map((f, i) => (
                  enable ? (
                    <ScrollReveal key={i} y={12 * k} delay={i * 0.04}>
                      <AccordionItem value={`item-${i}`}>
                        <AccordionTrigger className="px-4 py-3 text-start">
                          <span className="text-base font-semibold">{f.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 text-muted-foreground">{f.answer}</AccordionContent>
                      </AccordionItem>
                    </ScrollReveal>
                  ) : (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger className="px-4 py-3 text-start">
                        <span className="text-base font-semibold">{f.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4 text-muted-foreground">{f.answer}</AccordionContent>
                    </AccordionItem>
                  )
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
