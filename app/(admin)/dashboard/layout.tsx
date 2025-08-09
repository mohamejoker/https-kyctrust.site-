"use client"

import React from "react"
import ReduxProvider from "@/components/providers/redux-provider"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import UnlockGate from "@/components/dashboard/unlock"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // We render UnlockGate inside the main column; when unlocked, it disappears
  return (
    <ReduxProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-4 md:p-6">
            <UnlockGate onUnlocked={() => { /* no-op; gate hides itself */ }} />
            {children}
          </main>
        </div>
      </div>
    </ReduxProvider>
  )
}
