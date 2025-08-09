"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Bundle } from "@/lib/types"
import { paletteGrad } from "@/lib/palette"
import { useParallax, useInViewOnce } from "@/hooks/use-parallax"
import { useCMS } from "@/lib/store"

export function AppIconsBlock({
  data,
  isRTL,
  palette,
}: {
  data: Bundle
  isRTL: boolean
  palette: ReturnType<typeof paletteGrad>
}) {
  const { design } = useCMS()
  const parallax = useParallax(design.anim?.parallax ?? 10)
  const logos = Array.isArray(data.logos) ? data.logos : []

  return (
    <section
      className="px-4 py-16"
      ref={parallax.ref as any}
      onPointerMove={parallax.onMove as any}
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold md:text-5xl">
            <span
              className={`bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`}
            >
              {isRTL ? "تطبيقات وخدمات مدعومة" : "Supported Apps & Services"}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
            {isRTL
              ? "نعمل مع أشهر المنصات والخدمات المالية لتقديم تجربة موثوقة."
              : "We work with popular platforms and financial services to provide a trusted experience."}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {logos.map((l, i) => (
            <LogoTile
              key={i}
              name={l.name}
              src={l.src}
              url={l.url}
              palette={palette}
              mult={((i % 5) + 1) * 0.12}
              styleFor={parallax.styleFor}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function LogoTile({
  name,
  src,
  url,
  palette,
  mult,
  styleFor,
}: {
  name: string
  src: string
  url?: string
  palette: ReturnType<typeof paletteGrad>
  mult: number
  styleFor: (mult?: number) => React.CSSProperties
}) {
  const { ref, entered } = useInViewOnce(0.2)
  return (
    <a
      ref={ref as any}
      href={url || "#"}
      target={url ? "_blank" : "_self"}
      rel={url ? "noopener noreferrer" : undefined}
      className="group block"
      style={entered ? undefined : styleFor(mult)}
      aria-label={url ? `${name} (opens in new tab)` : name}
    >
      <Card className="border-neutral-200/60 bg-white/70 transition-all hover:-translate-y-1 hover:shadow-xl backdrop-blur dark:border-neutral-800/60 dark:bg-neutral-900/50">
        <CardContent className="flex aspect-[5/3] items-center justify-center p-4">
          <Image
            src={src || "/placeholder.svg?height=64&width=64&query=app%20logo"}
            alt={`${name} logo`}
            width={120}
            height={72}
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 10vw"
            className="h-10 w-auto contrast-125 grayscale transition-all duration-300 group-hover:grayscale-0"
            priority={false}
          />
        </CardContent>
      </Card>
      <div className="mt-2 text-center text-sm text-muted-foreground">{name}</div>
      <div
        className={`mx-auto mt-1 h-0.5 w-0 rounded-full bg-gradient-to-r ${palette.range} transition-all duration-300 group-hover:w-10`}
      />
    </a>
  )
}
