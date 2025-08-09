"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Pencil, Trash2, RefreshCcw, Search } from "lucide-react"

type Service = {
  id?: string
  name: string
  category: string
  price: string
  description: string
  note?: string
  icon_image?: string
  active?: boolean
  popular?: boolean
  sort?: number
}

export default function ServicesAdminPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<Service[]>([])
  const [q, setQ] = useState("")
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [open, setOpen] = useState(false)

  const load = async () => {
    setBusy(true)
    try {
      const r = await fetch("/api/services", { cache: "no-store" })
      const j = await r.json()
      setItems(Array.isArray(j) ? j : [])
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to load services" })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter((i) => [i.name, i.category, i.price, i.description, i.note].join(" ").toLowerCase().includes(s))
  }, [items, q])

  const startNew = () => {
    setEditing({
      name: "",
      category: "",
      price: "",
      description: "",
      note: "",
      icon_image: "",
      active: true,
      popular: false,
      sort: items.length,
    })
    setOpen(true)
  }

  const save = async () => {
    if (!editing) return
    setBusy(true)
    try {
      const payload = { ...editing, sort: Number(editing.sort || 0) }
      if (!editing.id) {
        const r = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!r.ok) throw new Error((await r.json()).error || "Create failed")
      } else {
        const r = await fetch(`/api/services/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!r.ok) throw new Error((await r.json()).error || "Update failed")
      }
      toast({ title: "Saved", description: "Service saved successfully." })
      setOpen(false)
      setEditing(null)
      await load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Save failed" })
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id?: string) => {
    if (!id) return
    if (!confirm("Delete this service?")) return
    setBusy(true)
    try {
      const r = await fetch(`/api/services/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error((await r.json()).error || "Delete failed")
      toast({ title: "Deleted", description: "Service removed." })
      await load()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Delete failed" })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Services</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={busy}>
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={startNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-2">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="ps-9" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Active</th>
                  <th className="p-2 text-left">Popular</th>
                  <th className="p-2 text-left">Sort</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">{s.name}</td>
                    <td className="p-2">{s.category}</td>
                    <td className="p-2">{s.price}</td>
                    <td className="p-2">{s.active ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>}</td>
                    <td className="p-2">
                      {s.popular ? <Badge className="bg-amber-500 text-white hover:bg-amber-500">Popular</Badge> : "—"}
                    </td>
                    <td className="p-2">{s.sort ?? 0}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditing(s)
                            setOpen(true)
                          }}
                        >
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-muted-foreground" colSpan={7}>
                      No services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) setEditing(null)
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input
                value={editing?.name || ""}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), name: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Category</Label>
              <Input
                value={editing?.category || ""}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), category: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Price</Label>
              <Input
                value={editing?.price || ""}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), price: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea
                value={editing?.description || ""}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), description: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Note (optional)</Label>
              <Input
                value={editing?.note || ""}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), note: e.target.value }))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Icon Image URL (optional)</Label>
              <Input
                value={editing?.icon_image || ""}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), icon_image: e.target.value }))}
                placeholder="/images/logos/paypal.png or https://…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between rounded-md border p-2">
                <div className="grid">
                  <Label>Active</Label>
                  <span className="text-xs text-muted-foreground">Visible on landing</span>
                </div>
                <Switch
                  checked={!!editing?.active}
                  onCheckedChange={(v) => setEditing((prev) => ({ ...(prev as Service), active: v }))}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <div className="grid">
                  <Label>Popular</Label>
                  <span className="text-xs text-muted-foreground">Highlight badge</span>
                </div>
                <Switch
                  checked={!!editing?.popular}
                  onCheckedChange={(v) => setEditing((prev) => ({ ...(prev as Service), popular: v }))}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Sort (ascending)</Label>
              <Input
                type="number"
                value={editing?.sort ?? 0}
                onChange={(e) => setEditing((prev) => ({ ...(prev as Service), sort: Number(e.target.value || 0) }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={busy || !editing?.name || !editing?.category || !editing?.price || !editing?.description}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
