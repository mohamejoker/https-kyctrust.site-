"use client"

import React from "react"
import { useCMS } from "@/lib/store"
import { Label } from "@/components/ui/label"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { useDroppable, useDraggable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const palettes: { id: "violet-emerald" | "blue-purple" | "teal-indigo"; label: string; preview: string }[] = [
  { id: "violet-emerald", label: "Violet → Emerald", preview: "from-violet-600 to-emerald-600" },
  { id: "blue-purple", label: "Blue → Purple", preview: "from-blue-600 to-purple-600" },
  { id: "teal-indigo", label: "Teal → Indigo", preview: "from-teal-600 to-indigo-600" },
]

function Swatch({ id, label, preview }: { id: string; label: string; preview: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id })
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("rounded-lg border p-2 shadow-sm transition", isDragging ? "opacity-70" : "")}
      style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined }}
    >
      <div className={cn("h-10 w-40 rounded bg-gradient-to-r", preview)} />
      <div className="mt-1 text-xs">{label}</div>
    </div>
  )
}

function DropZone({ activePreview }: { activePreview: string }) {
  const { setNodeRef, isOver } = useDroppable({ id: "active-palette" })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "grid h-14 w-full place-items-center rounded-lg border-2 border-dashed",
        isOver ? "border-emerald-500" : "border-muted"
      )}
    >
      <div className={cn("h-10 w-48 rounded bg-gradient-to-r", activePreview)} />
    </div>
  )
}

export function DesignForm() {
  const { design, setDesign } = useCMS()
  const active = palettes.find((p) => p.id === design.palette) ?? palettes[0]

  function onDragEnd(e: DragEndEvent) {
    if (e.over?.id === "active-palette") {
      const id = String(e.active.id) as (typeof palettes)[number]["id"]
      setDesign({ palette: id })
    }
  }

  const anim = design.anim || { enableReveal: true, intensity: 1, parallax: 14 }

  return (
    <div className="space-y-4">
      <Label className="text-sm">Theme Palette (Drag a swatch into the target)</Label>
      <DndContext onDragEnd={onDragEnd}>
        <DropZone activePreview={active.preview} />
        <div className="mt-3 grid grid-cols-1 gap-2">
          {palettes.map((p) => (
            <Swatch key={p.id} id={p.id} label={p.label} preview={p.preview} />
          ))}
        </div>
      </DndContext>

      <div className="mt-4 grid gap-3">
        <Label className="text-sm">Animations</Label>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div className="text-sm">Enable scroll reveal</div>
          <Switch
            checked={anim.enableReveal}
            onCheckedChange={(v) => setDesign({ anim: { ...anim, enableReveal: v } })}
          />
        </div>
        <div className="rounded-md border p-3">
          <Label className="mb-2 block text-xs">Reveal intensity (0.5 - 1.5)</Label>
          <Input
            type="number"
            step="0.1"
            min={0.5}
            max={1.5}
            value={anim.intensity}
            onChange={(e) => setDesign({ anim: { ...anim, intensity: Number(e.target.value) } })}
          />
        </div>
        <div className="rounded-md border p-3">
          <Label className="mb-2 block text-xs">Parallax factor (px)</Label>
          <Input
            type="number"
            min={0}
            max={40}
            value={anim.parallax}
            onChange={(e) => setDesign({ anim: { ...anim, parallax: Number(e.target.value) } })}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        يمكنك التحكم بتأثيرات الحركة أثناء التمرير وتعديل شدتها وسلوك البارالاكس بسهولة من هنا.
      </div>
    </div>
  )
}
