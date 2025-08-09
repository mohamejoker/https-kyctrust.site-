"use client"

import { useCMS } from "@/lib/store"
import { paletteGrad } from "@/lib/palette"
import { cn } from "@/lib/utils"

export function SiteFooter() {
  const { design, locale, content } = useCMS()
  const data = content[locale]
  const palette = paletteGrad(design.palette)
  return (
    <footer className="mt-10">
      <div
        className={cn(
          "h-0.5 w-full bg-gradient-to-r opacity-80",
          palette.range
        )}
        aria-hidden
      />
      <div className="bg-neutral-950 px-4 py-10 text-neutral-300">
        <div className="mx-auto max-w-7xl text-center">
          <div className="text-sm">
            {data.site.tagline}
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            © {new Date().getFullYear()} {data.site.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
