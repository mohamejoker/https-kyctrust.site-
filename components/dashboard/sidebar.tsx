"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, BarChart2, Settings, PieChart } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const nav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/content", icon: FileText, label: "Content" },
    { href: "/dashboard/content/snapshots", icon: FileText, label: "Snapshots" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/analytics", icon: PieChart, label: "Analytics" },
    { href: "/dashboard/reports", icon: BarChart2, label: "Reports" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <aside className="hidden h-screen w-64 flex-col border-r bg-background p-4 md:flex">
      <div className="mb-6 text-lg font-bold">Admin Console</div>
      <nav className="flex-1 space-y-1">
        {nav.map((n) => {
          const active = pathname === n.href
          const Icon = n.icon
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                active && "bg-accent"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{n.label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="mt-4 text-xs text-muted-foreground">v1.0 demo</div>
    </aside>
  )
}
