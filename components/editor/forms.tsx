"use client"

import { useCMS } from "@/lib/store"
import type { Locale, Service } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ImageIcon, Eraser } from 'lucide-react'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function Row({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="rounded-lg border bg-card p-3" {...attributes} {...listeners}>
      {children}
    </div>
  )
}

export function SiteForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const site = content[locale].site
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 overflow-hidden rounded-md border bg-muted">
          {site.logoSrc ? <img src={site.logoSrc || "/placeholder.svg"} alt="logo" className="h-full w-full object-contain" /> : null}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2">
          <Input value={site.logoSrc || ""} onChange={(e) => setContent(locale, { site: { ...site, logoSrc: e.target.value } })} placeholder="/images/brand/logo.png" />
          <Button variant="outline" size="sm" onClick={() => setContent(locale, { site: { ...site, logoSrc: "" } })}>
            <Eraser className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>
      </div>
      <Input value={site.name} onChange={(e) => setContent(locale, { site: { ...site, name: e.target.value } })} placeholder="Site Name" />
      <Input value={site.tagline} onChange={(e) => setContent(locale, { site: { ...site, tagline: e.target.value } })} placeholder="Tagline" />
      <Input value={site.phone} onChange={(e) => setContent(locale, { site: { ...site, phone: e.target.value } })} placeholder="Phone" />
      <Textarea value={site.description} onChange={(e) => setContent(locale, { site: { ...site, description: e.target.value } })} placeholder="Description" />
    </div>
  )
}

export function HeroForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const hero = content[locale].hero
  return (
    <div className="space-y-3">
      <Input value={hero.title} onChange={(e) => setContent(locale, { hero: { ...hero, title: e.target.value } })} placeholder="Title" />
      <Input value={hero.subtitle} onChange={(e) => setContent(locale, { hero: { ...hero, subtitle: e.target.value } })} placeholder="Subtitle" />
      <Textarea value={hero.description} onChange={(e) => setContent(locale, { hero: { ...hero, description: e.target.value } })} placeholder="Description" />
      <div className="grid grid-cols-2 gap-2">
        <Input value={hero.cta} onChange={(e) => setContent(locale, { hero: { ...hero, cta: e.target.value } })} placeholder="Primary CTA" />
        <Input value={hero.secondary} onChange={(e) => setContent(locale, { hero: { ...hero, secondary: e.target.value } })} placeholder="Secondary CTA" />
      </div>
      <div className="rounded-lg border p-3">
        <div className="mb-2 text-sm font-medium">{locale === "ar" ? "إحصاءات البطل" : "Hero stats"}</div>
        {hero.stats.map((st, idx) => (
          <div key={idx} className="mb-2 grid grid-cols-2 gap-2">
            <Input value={st.number} onChange={(e) => {
              const copy = hero.stats.slice()
              copy[idx] = { ...copy[idx], number: e.target.value }
              setContent(locale, { hero: { ...hero, stats: copy } })
            }} placeholder={locale === "ar" ? "الرقم" : "Number"} />
            <Input value={st.label} onChange={(e) => {
              const copy = hero.stats.slice()
              copy[idx] = { ...copy[idx], label: e.target.value }
              setContent(locale, { hero: { ...hero, stats: copy } })
            }} placeholder={locale === "ar" ? "العنوان" : "Label"} />
          </div>
        ))}
        <div className="flex gap-2">
          <Button size="sm" onClick={() => setContent(locale, { hero: { ...hero, stats: [...hero.stats, { number: "0", label: locale === "ar" ? "عنصر" : "Item" }] } })}>
            <Plus className="mr-2 h-4 w-4" /> {locale === "ar" ? "إضافة" : "Add"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => hero.stats.length > 0 && setContent(locale, { hero: { ...hero, stats: hero.stats.slice(0, -1) } })}>
            <Trash2 className="mr-2 h-4 w-4" /> {locale === "ar" ? "حذف آخر" : "Remove last"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function FeaturesForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const list = content[locale].features
  const onChange = (i: number, key: "title" | "desc" | "icon", value: string) => {
    const copy = list.slice()
    copy[i] = { ...copy[i], [key]: value }
    setContent(locale, { features: copy })
  }
  return (
    <div className="space-y-3">
      {list.map((f, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="grid grid-cols-3 gap-2">
            <Input value={f.title} onChange={(e) => onChange(i, "title", e.target.value)} placeholder="Title" />
            <Input value={f.icon} onChange={(e) => onChange(i, "icon", e.target.value)} placeholder='Icon name (e.g., "shield")' />
            <Input value={f.desc} onChange={(e) => onChange(i, "desc", e.target.value)} placeholder="Description" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ServicesForm({ locale }: { locale: Locale }) {
  const { content, addService, updateService, removeService, reorderServices } = useCMS()
  const list = content[locale].services
  const logos = content[locale].logos
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = list.findIndex((_, i) => String(i) === String(active.id))
    const newIndex = list.findIndex((_, i) => String(i) === String(over.id))
    const nextIndices = arrayMove(list.map((_, i) => i), oldIndex, newIndex)
    reorderServices(locale, nextIndices)
  }

  const add = () => {
    const s: Service = {
      name: locale === "ar" ? "خدمة جديدة" : "New Service",
      price: "$10",
      category: locale === "ar" ? "أخرى" : "Other",
      icon: "✨",
      iconImage: undefined,
      sort: list.length + 1,
      description: locale === "ar" ? "وصف مختصر" : "Short description",
      active: true,
      popular: false,
    }
    addService(locale, s)
  }

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={add} className="w-fit">
        <Plus className="mr-2 h-4 w-4" />
        {locale === "ar" ? "إضافة خدمة" : "Add Service"}
      </Button>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={list.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3">
            {list.map((s, i) => (
              <Row key={i} id={String(i)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="grid w-full grid-cols-6 gap-2">
                    <Input className="col-span-2" value={s.name} onChange={(e) => updateService(locale, i, { name: e.target.value })} placeholder="Name" />
                    <Input value={s.price} onChange={(e) => updateService(locale, i, { price: e.target.value })} placeholder="Price" />
                    <Input value={s.category} onChange={(e) => updateService(locale, i, { category: e.target.value })} placeholder="Category" />
                    <Input value={s.icon} onChange={(e) => updateService(locale, i, { icon: e.target.value })} placeholder="Emoji/Icon name" />
                    <div className="col-span-6 grid grid-cols-6 gap-2">
                      <div className="col-span-3">
                        <Label className="mb-1 block text-xs">{locale === "ar" ? "أيقونة (صورة)" : "Icon (Image)"}</Label>
                        <Select
                          value={s.iconImage || ""}
                          onValueChange={(v) => updateService(locale, i, { iconImage: v || undefined })}
                        >
                          <SelectTrigger><SelectValue placeholder={locale === "ar" ? "اختر من الشعارات" : "Pick from logos"} /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">{locale === "ar" ? "بدون" : "None"}</SelectItem>
                            {logos.map((l, idx) => (
                              <SelectItem key={idx} value={l.src}>{l.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label className="mb-1 block text-xs">{locale === "ar" ? "رابط صورة مخصص" : "Custom image URL"}</Label>
                        <div className="flex gap-2">
                          <Input
                            value={s.iconImage || ""}
                            onChange={(e) => updateService(locale, i, { iconImage: e.target.value || undefined })}
                            placeholder="/images/logos/paypal.png"
                          />
                          <Button variant="outline" size="icon" onClick={() => updateService(locale, i, { iconImage: undefined })} aria-label="Clear">
                            <Eraser className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <Textarea value={s.description} onChange={(e) => updateService(locale, i, { description: e.target.value })} placeholder="Description" />
                    </div>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => removeService(locale, i)} aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Row>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export function PaymentsForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const list = content[locale].payments
  const update = (i: number, k: "label" | "value" | "icon" | "color", v: string) => {
    const copy = list.slice()
    // @ts-expect-error union narrowing
    copy[i][k] = v
    setContent(locale, { payments: copy })
  }
  return (
    <div className="space-y-3">
      {list.map((p, i) => (
        <div key={i} className="rounded-lg border p-3">
          <div className="grid grid-cols-4 gap-2">
            <Input value={p.label} onChange={(e) => update(i, "label", e.target.value)} placeholder="Label" />
            <Input value={p.icon} onChange={(e) => update(i, "icon", e.target.value)} placeholder="Icon/Emoji" />
            <Input value={p.color} onChange={(e) => update(i, "color", e.target.value)} placeholder='Color ("red" | "green")' />
            <Input value={p.value} onChange={(e) => update(i, "value", e.target.value)} placeholder="Value" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function FAQForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const list = content[locale].faq
  const add = () => {
    const copy = list.slice()
    copy.push({ question: locale === "ar" ? "سؤال جديد" : "New question", answer: locale === "ar" ? "إجابة مختصرة" : "Short answer" })
    setContent(locale, { faq: copy })
  }
  const remove = (i: number) => {
    const copy = list.slice()
    copy.splice(i, 1)
    setContent(locale, { faq: copy })
  }
  const update = (i: number, key: "question" | "answer", v: string) => {
    const copy = list.slice()
    // @ts-expect-error index
    copy[i][key] = v
    setContent(locale, { faq: copy })
  }
  return (
    <div className="space-y-3">
      <Button size="sm" onClick={add} className="w-fit">
        <Plus className="mr-2 h-4 w-4" />
        {locale === "ar" ? "إضافة سؤال" : "Add Question"}
      </Button>
      {list.map((f, i) => (
        <div key={i} className="rounded-lg border p-3">
          <Input className="mb-2" value={f.question} onChange={(e) => update(i, "question", e.target.value)} placeholder="Question" />
          <Textarea value={f.answer} onChange={(e) => update(i, "answer", e.target.value)} placeholder="Answer" />
          <div className="mt-2">
            <Button variant="destructive" size="sm" onClick={() => remove(i)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {locale === "ar" ? "حذف" : "Remove"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Logos and Testimonials remain the same as before

export function LogosForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const logos = content[locale].logos
  const add = () => {
    const copy = logos.slice()
    copy.push({ name: "New App", src: "/generic-app-logo.png" })
    setContent(locale, { logos: copy })
  }
  const remove = (i: number) => {
    const copy = logos.slice()
    copy.splice(i, 1)
    setContent(locale, { logos: copy })
  }
  const update = (i: number, key: "name" | "src" | "url", v: string) => {
    const copy = logos.slice()
    // @ts-expect-error index
    copy[i][key] = v
    setContent(locale, { logos: copy })
  }
  return (
    <div className="space-y-3">
      <Button size="sm" onClick={add} className="w-fit">
        <Plus className="mr-2 h-4 w-4" />
        {locale === "ar" ? "إضافة شعار" : "Add Logo"}
      </Button>
      {logos.map((l, i) => (
        <div key={i} className="grid grid-cols-4 items-center gap-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <div className="h-8 w-8 overflow-hidden rounded border bg-muted">
              <img src={l.src || "/placeholder.svg"} alt={l.name} className="h-full w-full object-contain" />
            </div>
          </div>
          <Input value={l.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Name" />
          <Input value={l.src} onChange={(e) => update(i, "src", e.target.value)} placeholder="/images/logos/..." />
          <Input value={l.url || ""} onChange={(e) => update(i, "url", e.target.value)} placeholder="https://..." />
          <div className="col-span-4">
            <Button variant="destructive" size="sm" onClick={() => remove(i)}>
              <Trash2 className="mr-2 h-4 w-4" />
              {locale === "ar" ? "حذف" : "Remove"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TestimonialsForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const list = content[locale].testimonials
  const add = () => {
    const copy = list.slice()
    copy.push({ name: "User", role: "Customer", quote: locale === "ar" ? "تجربة ممتازة!" : "Great experience!" })
    setContent(locale, { testimonials: copy })
  }
  const remove = (i: number) => {
    const copy = list.slice()
    copy.splice(i, 1)
    setContent(locale, { testimonials: copy })
  }
  const update = (i: number, key: "name" | "role" | "quote" | "avatar", v: string) => {
    const copy = list.slice()
    // @ts-expect-error index
    copy[i][key] = v
    setContent(locale, { testimonials: copy })
  }
  return (
    <div className="space-y-3">
      <Button size="sm" onClick={add} className="w-fit">
        <Plus className="mr-2 h-4 w-4" />
        {locale === "ar" ? "إضافة شهادة" : "Add Testimonial"}
      </Button>
      {list.map((t, i) => (
        <div key={i} className="grid grid-cols-4 gap-2 rounded-lg border p-3">
          <Input value={t.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Name" />
          <Input value={t.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="Role" />
          <Input value={t.avatar || ""} onChange={(e) => update(i, "avatar", e.target.value)} placeholder="Avatar URL (optional)" />
          <Input className="col-span-4 md:col-span-4" value={t.quote} onChange={(e) => update(i, "quote", e.target.value)} placeholder="Quote" />
        </div>
      ))}
    </div>
  )
}

export function CTAForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const cta = content[locale].cta || { title: "", subtitle: "", primaryText: "", secondaryText: "" }
  const update = (patch: Partial<typeof cta>) => setContent(locale, { cta: { ...cta, ...patch } as any })
  return (
    <div className="space-y-3">
      <Input value={cta.title} onChange={(e) => update({ title: e.target.value })} placeholder={locale === "ar" ? "عنوان القسم" : "Section title"} />
      <Input value={cta.subtitle || ""} onChange={(e) => update({ subtitle: e.target.value })} placeholder={locale === "ar" ? "وصف مختصر (اختياري)" : "Short subtitle (optional)"} />
      <div className="grid grid-cols-2 gap-2">
        <Input value={cta.primaryText} onChange={(e) => update({ primaryText: e.target.value })} placeholder={locale === "ar" ? "زر أساسي" : "Primary button"} />
        <Input value={cta.secondaryText || ""} onChange={(e) => update({ secondaryText: e.target.value })} placeholder={locale === "ar" ? "زر ثانوي (اختياري)" : "Secondary button (optional)"} />
      </div>
    </div>
  )
}

export function ContactForm({ locale }: { locale: Locale }) {
  const { content, setContent } = useCMS()
  const contact = content[locale].contact

  const update = (patch: Partial<typeof contact>) => {
    setContent(locale, { contact: { ...contact, ...patch } as any })
  }

  const addFeature = () => {
    const next = [...contact.features, locale === "ar" ? "ميزة جديدة" : "New feature"]
    update({ features: next })
  }

  const removeFeature = (i: number) => {
    const next = contact.features.slice()
    next.splice(i, 1)
    update({ features: next })
  }

  const updateFeature = (i: number, v: string) => {
    const next = contact.features.slice()
    next[i] = v
    update({ features: next })
  }

  return (
    <div className="space-y-3">
      <Input
        value={contact.title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder={locale === "ar" ? "العنوان" : "Title"}
      />
      <Input
        value={contact.subtitle}
        onChange={(e) => update({ subtitle: e.target.value })}
        placeholder={locale === "ar" ? "العنوان الفرعي" : "Subtitle"}
      />
      <Input
        value={contact.whatsapp}
        onChange={(e) => update({ whatsapp: e.target.value })}
        placeholder={locale === "ar" ? "زر واتساب" : "WhatsApp CTA"}
      />
      <div className="rounded-lg border p-3">
        <div className="mb-2 text-sm font-medium">{locale === "ar" ? "مميزات" : "Features"}</div>
        <div className="flex flex-col gap-2">
          {contact.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={f} onChange={(e) => updateFeature(i, e.target.value)} />
              <Button variant="destructive" size="icon" onClick={() => removeFeature(i)} aria-label="Remove">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button size="sm" className="mt-3" onClick={addFeature}>
          <Plus className="mr-2 h-4 w-4" />
          {locale === "ar" ? "إضافة ميزة" : "Add Feature"}
        </Button>
      </div>
    )
  }
