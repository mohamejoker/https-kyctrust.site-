"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SimpleLineChart } from "@/components/dashboard/charts"
import { useAppSelector } from "@/lib/redux/store"
import { Loader2, RefreshCcw, UsersIcon, Database, Shield } from 'lucide-react'

type AnalyticsRow = { day: string; visitors: number; leads: number; orders: number; conversion_rate: string }

export default function DashboardHome() {
  const ui = useAppSelector((s) => s.ui)
  const [loading, setLoading] = useState(true)
  const [series, setSeries] = useState<{ t: string; v: number }[]>([])
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [regenPending, setRegenPending] = useState(false)
  const locale = ui.locale

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [a, u] = await Promise.all([fetch("/api/analytics"), fetch("/api/users")])
        const aj = (await a.json()) as AnalyticsRow[]
        const sj = aj.map((r) => ({ t: r.day.slice(5), v: r.visitors }))
        if (mounted) setSeries(sj)
        const uj = await u.json()
        if (mounted) setUsersCount(Array.isArray(uj) ? uj.length : null)
      } catch {
        if (mounted) {
          setSeries([])
          setUsersCount(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const kpis = useMemo(
    () => [
      { title: locale === "ar" ? "الزوار (14 يوم)" : "Visitors (14d)", value: series.reduce((a, b) => a + b.v, 0).toLocaleString() },
      { title: locale === "ar" ? "عدد المستخدمين" : "Users", value: usersCount === null ? "—" : usersCount.toString() },
    ],
    [locale, series, usersCount]
  )

  const regen = async () => {
    setRegenPending(true)
    try {
      await fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ days: 14 }) })
      const a = await fetch("/api/analytics")
      const aj = (await a.json()) as AnalyticsRow[]
      setSeries(aj.map((r) => ({ t: r.day.slice(5), v: r.visitors })))
    } finally {
      setRegenPending(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((k, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">{k.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{locale === "ar" ? "حماية لوحة التحكم" : "Dashboard Protection"}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              <span>{locale === "ar" ? "مؤمن بكلمة مرور" : "Password-gated"}</span>
            </div>
            <a href="/dashboard/settings" className="text-sm text-primary underline">
              {locale === "ar" ? "إدارة" : "Manage"}
            </a>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{locale === "ar" ? "الزوار اليوميون" : "Daily Visitors"}</CardTitle>
          <Button size="sm" onClick={regen} disabled={regenPending}>
            {regenPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            {locale === "ar" ? "تحديث البيانات" : "Regenerate"}
          </Button>
        </CardHeader>
        <CardContent>{loading ? <div className="text-sm text-muted-foreground">Loading…</div> : <SimpleLineChart data={series} height={160} />}</CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{locale === "ar" ? "إدارة المستخدمين" : "Manage Users"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">
              {locale === "ar" ? "اعرض وأضف وحدّث واحذف مستخدمين." : "View, add, update, and delete users."}
            </p>
            <div className="mt-3">
              <a href="/dashboard/users" className="text-primary underline">
                {locale === "ar" ? "الذهاب إلى المستخدمين" : "Go to Users"}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{locale === "ar" ? "نشر المحتوى" : "Publish Content"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground">
              {locale === "ar"
                ? "قم بالتعديل من صفحة المحتوى وانشر إلى صفحة الهبوط."
                : "Edit from Content page and publish to the landing page."}
            </p>
            <div className="mt-3">
              <a href="/dashboard/content" className="text-primary underline">
                {locale === "ar" ? "الذهاب إلى المحتوى" : "Go to Content"}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
