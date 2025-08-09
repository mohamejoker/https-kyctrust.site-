"use client"

import { useCMS } from "@/lib/store"
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { GripVertical } from 'lucide-react'

const TITLES: Record<string, { ar: string; en: string }> = {
  hero: { ar: "البطل", en: "Hero" },
  logos: { ar: "الشعارات", en: "Logos" },
  features: { ar: "المميزات", en: "Features" },
  services: { ar: "الخدمات", en: "Services" },
  payments: { ar: "الدفع", en: "Payments" },
  testimonials: { ar: "الشهادات", en: "Testimonials" },
  faq: { ar: "الأسئلة الشائعة", en: "FAQ" },
  contact: { ar: "التواصل", en: "Contact" },
}

function Item({ id, title, enabled }: { id: string; title: string; enabled: boolean }) {
  const { toggleBlock } = useCMS()
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        <button className="cursor-grab text-muted-foreground hover:text-foreground" aria-label="Drag" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor={`enable-${id}`} className="text-xs">
          {enabled ? "Enabled" : "Disabled"}
        </Label>
        <Switch id={`enable-${id}`} checked={enabled} onCheckedChange={(v) => toggleBlock(id, v)} />
      </div>
    </div>
  )
}

export function SectionList() {
  const { blocks, reorderBlocks, locale } = useCMS()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = blocks.map((b) => b.id)

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    const nextIds = arrayMove(ids, oldIndex, newIndex)
    reorderBlocks(nextIds)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {blocks.map((b) => {
            const t = TITLES[b.type] ?? { ar: b.type, en: b.type } // safe fallback
            const title = locale === "ar" ? t.ar : t.en
            return <Item key={b.id} id={b.id} title={title} enabled={b.enabled} />
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
