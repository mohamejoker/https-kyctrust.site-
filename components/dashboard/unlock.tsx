"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, Unlock } from 'lucide-react'

export default function UnlockGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [status, setStatus] = useState<"checking" | "locked" | "open">("checking")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/gate/status").then((r) => r.json()).then((j) => {
      setStatus(j.unlocked ? "open" : "locked")
      if (j.unlocked) onUnlocked()
    })
  }, [onUnlocked])

  const submit = async () => {
    setMsg(null)
    const r = await fetch("/api/gate/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) })
    if (r.ok) {
      setStatus("open")
      onUnlocked()
    } else {
      const j = await r.json().catch(() => ({}))
      setMsg(j.error || "Failed")
    }
  }

  if (status === "checking") {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Checking access...</div>
  }
  if (status === "open") return null

  return (
    <div className="grid min-h-[70vh] place-items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Dashboard Locked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Enter the dashboard password. If this is your first time, the password you enter will be set automatically.
          </p>
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" onClick={submit}>
            <Unlock className="mr-2 h-4 w-4" /> Unlock
          </Button>
          {msg && <div className="text-sm text-red-500">{msg}</div>}
        </CardContent>
      </Card>
    </div>
  )
}
