"use client"

import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/lib/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setLocale as setContentLocale } from "@/lib/redux/slices/content"
import { setLocale as setUILocale } from "@/lib/redux/slices/ui"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Page() {
  const dispatch = useAppDispatch()
  const { locale } = useAppSelector((s) => s.ui)
  const [curr, setCurr] = useState("")
  const [next, setNext] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  const changePassword = async () => {
    setMsg(null)
    const r = await fetch("/api/gate/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: curr, newPassword: next }),
    })
    if (r.ok) {
      setCurr("")
      setNext("")
      setMsg(locale === "ar" ? "تم تحديث كلمة المرور" : "Password updated")
    } else {
      const j = await r.json().catch(() => ({}))
      setMsg(j.error || (locale === "ar" ? "فشل التحديث" : "Update failed"))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="max-w-lg">
        <CardHeader><CardTitle>{locale === "ar" ? "الإعدادات" : "Settings"}</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 items-center gap-3">
          <Label>{locale === "ar" ? "اللغة" : "Language"}</Label>
          <Select
            value={locale}
            onValueChange={(v: "ar" | "en") => {
              dispatch(setUILocale(v))
              dispatch(setContentLocale(v))
            }}
          >
            <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <div className="col-span-2 pt-2 text-xs text-muted-foreground">
            Need low-level DB key editing? Use the DB Settings editor.
            <div className="mt-1">
              <Link href="/dashboard/settings/db" className="text-primary underline">
                Open DB Settings editor
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader><CardTitle>{locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input type="password" placeholder={locale === "ar" ? "كلمة المرور الحالية" : "Current password"} value={curr} onChange={(e) => setCurr(e.target.value)} />
          <Input type="password" placeholder={locale === "ar" ? "كلمة المرور الجديدة" : "New password"} value={next} onChange={(e) => setNext(e.target.value)} />
          <Button onClick={changePassword}>{locale === "ar" ? "تحديث" : "Update"}</Button>
          {msg && <div className="text-sm text-muted-foreground">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
