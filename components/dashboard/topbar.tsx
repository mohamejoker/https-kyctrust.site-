"use client"

import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { setLocale } from "@/lib/redux/slices/ui"
import { Button } from "@/components/ui/button"
import { Globe, Sun, Moon } from 'lucide-react'
import { useTheme } from "next-themes"

export function Topbar() {
  const { locale } = useAppSelector((s) => s.ui)
  const dispatch = useAppDispatch()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <div className="text-sm text-muted-foreground">
        {locale === "ar" ? "لوحة تحكم الإدارة" : "Admin Dashboard"}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => dispatch(setLocale(locale === "ar" ? "en" : "ar"))}>
          <Globe className="mr-2 h-4 w-4" />
          {locale === "ar" ? "English" : "عربي"}
        </Button>
        <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  )
}
