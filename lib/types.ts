export type Locale = "ar" | "en"

export type Stat = { number: string; label: string }
export type Feature = { title: string; desc: string; icon: string } // icon by name

export type Service = {
  name: string
  price: string
  category: string
  icon: string // emoji or name
  iconImage?: string // optional image path for real app icon
  popular?: boolean
  active?: boolean
  sort: number
  description: string
  note?: string
}

export type Payment = { label: string; value: string; icon: string; color: "red" | "green" }
export type FAQ = { question: string; answer: string }

export type SiteInfo = {
  name: string
  description: string
  phone: string
  tagline: string
  logoSrc?: string // branding logo
}

export type Hero = {
  title: string
  subtitle: string
  description: string
  cta: string
  secondary: string
  stats: Stat[]
}

export type Logo = { name: string; src: string; url?: string }
export type Testimonial = { name: string; role: string; quote: string; avatar?: string }

export type CTA = {
  title: string
  subtitle?: string
  primaryText: string
  secondaryText?: string
}

export type ContactInfo = {
  title: string
  subtitle: string
  whatsapp: string
  features: string[]
}

export type Bundle = {
  site: SiteInfo
  hero: Hero
  services: Service[]
  payments: Payment[]
  features: Feature[]
  faq: FAQ[]
  contact: ContactInfo
  logos: Logo[]
  testimonials: Testimonial[]
  cta?: CTA
}

export type Content = Record<Locale, Bundle>

export type BlockType =
  | "hero"
  | "logos"
  | "features"
  | "services"
  | "payments"
  | "testimonials"
  | "faq"
  | "contact"
  | "cta"

export type BlockConfig = {
  id: string
  type: BlockType
  enabled: boolean
}

export type Palette = "violet-emerald" | "blue-purple" | "teal-indigo"

export type Design = {
  theme: "system" | "light" | "dark"
  palette: Palette
  anim?: {
    enableReveal: boolean
    intensity: number // 0.5-1.5 multiplier
    parallax: number // px movement factor
  }
}

export type CMSState = {
  locale: Locale
  blocks: BlockConfig[]
  content: Content
  design: Design
}
