"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { defaultState } from "./default-content"
import type { BlockConfig, CMSState, Content, Design, Locale, Service } from "./types"

type Actions = {
  setLocale: (l: Locale) => void
  setDesign: (d: Partial<Design>) => void
  reorderBlocks: (ids: string[]) => void
  toggleBlock: (id: string, enabled: boolean) => void
  setContent: (locale: Locale, newContent: Partial<Content[Locale]>) => void
  addService: (locale: Locale, s: Service) => void
  updateService: (locale: Locale, index: number, patch: Partial<Service>) => void
  removeService: (locale: Locale, index: number) => void
  reorderServices: (locale: Locale, newOrder: number[]) => void
  importJSON: (state: CMSState) => void
  reset: () => void
}

export const useCMS = create<CMSState & Actions>()(
  persist(
    (set, get) => ({
      ...defaultState,
      setLocale: (l) => set({ locale: l }),
      setDesign: (d) => {
        const curr = get().design
        const anim = { enableReveal: true, intensity: 1, parallax: 14, ...(curr.anim || {}), ...(d as any).anim }
        set({ design: { ...curr, ...d, anim } })
      },
      reorderBlocks: (ids) => {
        const map = new Map(get().blocks.map((b) => [b.id, b]))
        const next: BlockConfig[] = ids.map((id) => map.get(id)!).filter(Boolean)
        set({ blocks: next })
      },
      toggleBlock: (id, enabled) => {
        set({ blocks: get().blocks.map((b) => (b.id === id ? { ...b, enabled } : b)) })
      },
      setContent: (locale, newContent) => {
        set({
          content: { ...get().content, [locale]: { ...get().content[locale], ...newContent } },
        })
      },
      addService: (locale, s) => {
        const curr = get().content[locale].services
        set({ content: { ...get().content, [locale]: { ...get().content[locale], services: [...curr, s] } } })
      },
      updateService: (locale, index, patch) => {
        const curr = get().content[locale].services.slice()
        curr[index] = { ...curr[index], ...patch }
        set({ content: { ...get().content, [locale]: { ...get().content[locale], services: curr } } })
      },
      removeService: (locale, index) => {
        const curr = get().content[locale].services.slice()
        curr.splice(index, 1)
        set({ content: { ...get().content, [locale]: { ...get().content[locale], services: curr } } })
      },
      reorderServices: (locale, newOrder) => {
        const curr = get().content[locale].services.slice()
        const next = newOrder.map((i) => curr[i])
        set({ content: { ...get().content, [locale]: { ...get().content[locale], services: next } } })
      },
      importJSON: (state) => set(state),
      reset: () => set(defaultState),
    }),
    {
      name: "kyctrust-cms",
      version: 3,
      migrate: (state: any) => {
        if (!state) return defaultState
        const s = { ...state }

        // Ensure blocks are valid (replace legacy 'media' with 'logos')
        if (Array.isArray(s.blocks)) {
          s.blocks = s.blocks.map((b: any) => (b?.type === "media" ? { ...b, type: "logos" } : b))
        } else {
          s.blocks = defaultState.blocks
        }

        // Ensure locales and required arrays exist + site logo and iconImage field
        const locales: Locale[] = ["ar", "en"]
        s.content = s.content || {}
        for (const loc of locales) {
          s.content[loc] = s.content[loc] || defaultState.content[loc]
          const bundle = s.content[loc]
          if (!Array.isArray(bundle.logos)) bundle.logos = defaultState.content[loc].logos
          if (!Array.isArray(bundle.testimonials)) bundle.testimonials = defaultState.content[loc].testimonials || []
          bundle.site = bundle.site || defaultState.content[loc].site
          if (!bundle.site.logoSrc) bundle.site.logoSrc = "/images/brand/novapay-logo.png"
          bundle.services = Array.isArray(bundle.services)
            ? bundle.services.map((sv: any) => ({ iconImage: undefined, ...sv }))
            : defaultState.content[loc].services
        }
        // Ensure design + animation config
        s.design = s.design || defaultState.design
        s.design.anim = { enableReveal: true, intensity: 1, parallax: 14, ...(s.design.anim || {}) }

        return s
      },
    }
  )
)
