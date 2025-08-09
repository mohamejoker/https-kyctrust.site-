"use client"

import { useCMS } from "@/lib/store"
import { paletteGrad } from "@/lib/palette"
import { HeroBlock } from "./hero-block"
import { FeaturesBlock } from "./features-block"
import { ServicesBlock } from "./services-block"
import { PaymentsBlock } from "./payments-block"
import { FAQBlock } from "./faq-block"
import { ContactBlock } from "./contact-block"
import { AppIconsBlock } from "./app-icons-block"
import { TestimonialsBlock } from "./testimonials-block"
import { CtaBlock } from "./cta-block"

export function BlocksRenderer() {
  const { locale, content, blocks, design } = useCMS()
  const data = content[locale]
  const isRTL = locale === "ar"
  const palette = paletteGrad(design.palette)

  return (
    <>
      {blocks
        .filter((b) => b.enabled)
        .map((b) => {
          switch (b.type) {
            case "hero":
              return <HeroBlock key={b.id} data={data} isRTL={isRTL} locale={locale} palette={palette} />
            case "logos":
              return <AppIconsBlock key={b.id} data={data} isRTL={isRTL} palette={palette} />
            case "features":
              return <FeaturesBlock key={b.id} data={data} isRTL={isRTL} palette={palette} />
            case "services":
              return <ServicesBlock key={b.id} data={data} isRTL={isRTL} locale={locale} palette={palette} />
            case "payments":
              return <PaymentsBlock key={b.id} data={data} isRTL={isRTL} palette={palette} />
            case "testimonials":
              return <TestimonialsBlock key={b.id} data={data} isRTL={isRTL} palette={palette} />
            case "faq":
              return <FAQBlock key={b.id} data={data} isRTL={isRTL} palette={palette} />
            case "contact":
              return <ContactBlock key={b.id} data={data} locale={locale} palette={palette} />
            case "cta":
              return <CtaBlock key={b.id} data={data} isRTL={isRTL} palette={palette} />
            default:
              return null
          }
        })}
    </>
  )
}
