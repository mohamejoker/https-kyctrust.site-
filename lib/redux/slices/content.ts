"use client"

import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export type Stat = { number: string; label: string }
export type Feature = { title: string; desc: string; icon: string }
export type Service = {
  name: string; price: string; category: string; icon: string; popular?: boolean; active?: boolean; sort: number; description: string; note?: string
}
export type Payment = { label: string; value: string; icon: string; color: "red" | "green" }
export type FAQ = { question: string; answer: string }
export type SiteInfo = { name: string; description: string; phone: string; tagline: string }

export type ContentBundle = {
  site: SiteInfo
  hero: { title: string; subtitle: string; description: string; cta: string; secondary: string; stats: Stat[] }
  features: Feature[]
  services: Service[]
  payments: Payment[]
  faq: FAQ[]
  contact: { title: string; subtitle: string; whatsapp: string; features: string[] }
  media: { videoSrc: string; videoPoster: string; images: { src: string; alt: string }[] }
}

type ContentState = {
  locale: "ar" | "en"
  ar: ContentBundle
  en: ContentBundle
}

const base: ContentBundle = {
  site: { name: "KYCtrust", description: "Specialized service...", phone: "+20-106-245-3344", tagline: "Your trusted partner" },
  hero: { title: "KYCtrust", subtitle: "Complete Digital Financial Services", description: "Get the best...", cta: "Get Started", secondary: "Explore Services", stats: [{ number: "1000+", label: "Happy Clients" }, { number: "24/7", label: "Support" }, { number: "99.9%", label: "Success" }, { number: "15+", label: "Services" }] },
  features: [{ title: "Fast", desc: "Delivery 24-48h", icon: "clock" }, { title: "Secure", desc: "Data protection", icon: "shield" }, { title: "Support", desc: "24/7 team", icon: "users" }, { title: "Pricing", desc: "Competitive rates", icon: "award" }],
  services: [{ name: "Payoneer", price: "$30", category: "Banking", icon: "💳", popular: true, active: true, sort: 1, description: "Trusted global account" }],
  payments: [{ label: "Vodafone Cash", value: "01062453344", icon: "📱", color: "red" }, { label: "USDT TRC20", value: "TFUt8GR...rmQK", icon: "₿", color: "green" }],
  faq: [{ question: "How long?", answer: "24-48 hours" }],
  contact: { title: "Get Started Today", subtitle: "Support team available 24/7", whatsapp: "Contact via WhatsApp", features: ["Instant Reply", "Free Consultation", "Service Guarantee"] },
  media: { videoSrc: "/placeholder.svg?height=360&width=640", videoPoster: "/placeholder.svg?height=360&width=640", images: [{ src: "/placeholder.svg?height=200&width=320", alt: "image 1" }, { src: "/placeholder.svg?height=200&width=320", alt: "image 2" }] },
}

const initialState: ContentState = {
  locale: "ar",
  ar: {
    ...base,
    site: { name: "KYCtrust", description: "خدمة متخصصة في الحسابات البنكية الإلكترونية والخدمات المالية الآمنة", phone: "+20-106-245-3344", tagline: "شريكك الموثوق في العالم الرقمي" },
    hero: { ...base.hero, title: "KYCtrust", subtitle: "منصة متكاملة للخدمات المالية الرقمية", description: "احصل على أفضل الحسابات البنكية الإلكترونية والمحافظ الرقمية بأمان وسرعة", cta: "ابدأ الآن", secondary: "تصفح الخدمات", stats: [{ number: "1000+", label: "عميل راضي" }, { number: "24/7", label: "دعم فني" }, { number: "99.9%", label: "معدل النجاح" }, { number: "15+", label: "خدمة" }] },
  },
  en: base,
}

const content = createSlice({
  name: "content",
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<"ar" | "en">) {
      state.locale = action.payload
    },
    setHero(state, action: PayloadAction<Partial<ContentBundle["hero"]>>) {
      const loc = state.locale
      state[loc].hero = { ...state[loc].hero, ...action.payload }
    },
    setSite(state, action: PayloadAction<Partial<ContentBundle["site"]>>) {
      const loc = state.locale
      state[loc].site = { ...state[loc].site, ...action.payload }
    },
    setFeatures(state, action: PayloadAction<ContentBundle["features"]>) {
      state[state.locale].features = action.payload
    },
    setServices(state, action: PayloadAction<ContentBundle["services"]>) {
      state[state.locale].services = action.payload
    },
    setPayments(state, action: PayloadAction<ContentBundle["payments"]>) {
      state[state.locale].payments = action.payload
    },
    setFAQ(state, action: PayloadAction<ContentBundle["faq"]>) {
      state[state.locale].faq = action.payload
    },
    setMedia(state, action: PayloadAction<ContentBundle["media"]>) {
      state[state.locale].media = action.payload
    },
  },
})

export const { setLocale, setHero, setSite, setFeatures, setServices, setPayments, setFAQ, setMedia } = content.actions
export default content.reducer
export type { ContentBundle }
