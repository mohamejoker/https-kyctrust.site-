"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useCMS } from "@/lib/store"
import { paletteGrad } from "@/lib/palette"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Globe, Moon, Sun, MessageCircle, Shield } from 'lucide-react'
import { buildWhatsApp } from "@/lib/whatsapp"

export function SiteHeader() {
  const { locale, content, design, setLocale } = useCMS()
  const data = content[locale]
  const { theme, setTheme } = useTheme()
  const palette = paletteGrad(design.palette)

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/70",
        "border-neutral-200/60 dark:border-neutral-800/60"
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className={cn(
              "grid h-9 w-9 place-items-center overflow-hidden rounded-lg text-white shadow ring-1 ring-black/5 dark:ring-white/5",
              `bg-gradient-to-br ${palette.range}`
            )}
          >
            {data.site.logoSrc ? (
              <Image
                src={data.site.logoSrc || "/placeholder.svg"}
                width={28}
                height={28}
                alt={`${data.site.name} logo`}
                className="h-7 w-7 object-contain"
                priority
              />
            ) : (
              <Shield className="h-4 w-4" aria-label="Brand logo" />
            )}
          </span>
          <span
            className={cn(
              "hidden text-sm font-bold sm:inline-block",
              `bg-gradient-to-r ${palette.range} bg-clip-text text-transparent`
            )}
          >
            {data.site.name}
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#services" className="text-sm text-muted-foreground hover:text-foreground">
            {locale === "ar" ? "الخدمات" : "Services"}
          </a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
            {locale === "ar" ? "الأسئلة" : "FAQ"}
          </a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
            {locale === "ar" ? "تواصل" : "Contact"}
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          >
            <Globe className="mr-2 h-4 w-4" />
            {locale === "ar" ? "English" : "عربي"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            className={cn(
              "hidden sm:inline-flex",
              `bg-gradient-to-r ${palette.range} text-white`
            )}
            size="sm"
            onClick={() =>
              window.open(
                buildWhatsApp(locale === "ar" ? "استفسار سريع" : "Quick inquiry", "N/A", locale, data.site.name),
                "_blank"
              )
            }
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {locale === "ar" ? "ابدأ الدردشة" : "Chat now"}
          </Button>
        </div>
      </div>
    </header>
  )
}
