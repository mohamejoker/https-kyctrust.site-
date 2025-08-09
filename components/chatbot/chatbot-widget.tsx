"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, MessageSquareText, SendHorizonal, Settings2, X, Sparkles, PhoneCall, Info } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useCMS } from "@/lib/store"
import { paletteGrad } from "@/lib/palette"
import { buildWhatsApp } from "@/lib/whatsapp"

type QA = { question: string; answer: string }
type Service = { name: string; price: string; category: string; description?: string }
type Published = {
  ar?: { hero?: any; site?: any; contact?: any; faq?: QA[]; services?: Service[] }
  en?: { hero?: any; site?: any; contact?: any; faq?: QA[]; services?: Service[] }
  design?: any
}

type Msg = { id: string; role: "user" | "assistant"; content: string }

function uuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function asTextNodes(text: string) {
  // lightweight formatting: preserve newlines and convert links
  const parts = text.split("\n")
  return parts.map((line, i) => {
    const tokens = line.split(/(https?:\/\/\S+)/g).map((t, j) =>
      /^https?:\/\//.test(t) ? (
        <a key={`${i}-${j}`} href={t} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {t}
        </a>
      ) : (
        <React.Fragment key={`${i}-${j}`}>{t}</React.Fragment>
      )
    )
    return (
      <p key={i} className="mb-1.5">
        {tokens}
      </p>
    )
  })
}

export function ChatbotWidget() {
  const { locale, design, content } = useCMS()
  const palette = paletteGrad(design.palette)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [sessionId, setSessionId] = useState<string>("")
  const [pub, setPub] = useState<Published | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [tone, setTone] = useState<"friendly" | "professional">("friendly")

  // session
  useEffect(() => {
    const stored = localStorage.getItem("chat:sessionId")
    const sid = stored || uuid()
    if (!stored) localStorage.setItem("chat:sessionId", sid)
    setSessionId(sid)
    const saved = localStorage.getItem("chat:history")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setMessages(parsed)
      } catch {}
    }
  }, [])
  useEffect(() => {
    localStorage.setItem("chat:history", JSON.stringify(messages.slice(-40)))
  }, [messages])

  // load published
  useEffect(() => {
    ;(async () => {
      try {
        const r = await fetch("/api/content/published", { cache: "no-store" })
        if (r.ok) {
          const j = (await r.json()) as Published | null
          setPub(j)
        }
      } catch {}
    })()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, open, busy])

  const bundle = useMemo(() => (locale === "ar" ? pub?.ar : pub?.en) || content[locale], [pub, locale, content])
  const faqs = useMemo(() => (Array.isArray((bundle as any)?.faq) ? (bundle as any).faq.slice(0, 5) : []), [bundle])
  const services = useMemo(
    () => (Array.isArray((bundle as any)?.services) ? (bundle as any).services.slice(0, 6) : []),
    [bundle]
  )
  const site = (bundle as any)?.site || content[locale]?.site
  const contact = (bundle as any)?.contact || content[locale]?.contact

  function greet() {
    const hours = new Date().getHours()
    const isNight = hours >= 20 || hours < 6
    const g = locale === "ar"
      ? isNight ? "مساء الخير" : "مرحباً"
      : isNight ? "Good evening" : "Hello"
    return g
  }

  async function sendMessage(text: string) {
    if (!text.trim() || busy) return
    const userMsg: Msg = { id: uuid(), role: "user", content: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput("")
    setBusy(true)
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId,
          userPreferences: { locale, tone },
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const j = await res.json()
      const botMsg: Msg = {
        id: uuid(),
        role: "assistant",
        content: j?.text || (locale === "ar" ? "عذراً، حدث خطأ." : "Sorry, something went wrong."),
      }
      setMessages((m) => [...m, botMsg])
    } catch {
      const botMsg: Msg = {
        id: uuid(),
        role: "assistant",
        content: locale === "ar" ? "عذراً، حدث خطأ." : "Sorry, something went wrong.",
      }
      setMessages((m) => [...m, botMsg])
    } finally {
      setBusy(false)
    }
  }

  const title = locale === "ar" ? "مساعد KYCtrust" : "KYCtrust Assistant"
  const subtitle =
    locale === "ar"
      ? "اسأل عن الخدمات والأسعار والدعم."
      : "Ask about services, pricing, and support."

  return (
    <>
      {/* Floating launcher */}
      <button
        aria-label={title}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm shadow-lg ring-1 ring-black/10 transition hover:scale-[1.02] md:bottom-6 md:right-6",
          "bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70",
          `border border-neutral-200/60 dark:border-neutral-800/60`
        )}
      >
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full text-white shadow",
            `bg-gradient-to-br ${palette.range}`
          )}
        >
          <MessageSquareText className="h-4 w-4" />
        </span>
        <span className="hidden font-medium sm:inline">
          {locale === "ar" ? "تحتاج مساعدة؟" : "Need help?"}
        </span>
        <span className="ml-1 hidden items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-400 sm:inline-flex">
          <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {locale === "ar" ? "متصل" : "Online"}
        </span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className={cn("grid h-8 w-8 place-items-center rounded-md text-white", `bg-gradient-to-br ${palette.range}`)}>
                  <Sparkles className="h-4 w-4" />
                </span>
                {title}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setTone(tone === "friendly" ? "professional" : "friendly")}
                >
                  <Settings2 className="h-4 w-4" />
                  {locale === "ar" ? (tone === "friendly" ? "ودّي" : "احترافي") : tone}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </SheetTitle>
            <p className="px-1 text-xs text-muted-foreground">
              {greet()} — {subtitle}
            </p>
          </SheetHeader>

          {/* Knowledge panel (collapsible hint) */}
          <div className="border-b bg-muted/30 p-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "يعتمد على محتوى الموقع المنشور (الخدمات والأسئلة الشائعة)."
                  : "Grounded by your published site content (services & FAQs)."}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Quick chips (first load) */}
            {messages.length === 0 && (
              <div className="mb-3 rounded-md border bg-card p-3 text-sm">
                <div className="mb-1 font-medium">
                  {locale === "ar" ? "مرحبًا! كيف يمكنني مساعدتك اليوم؟" : "Hi! How can I help you today?"}
                </div>
                <div className="text-muted-foreground">
                  {locale === "ar" ? "اسأل عن خدمة أو اطلب توجيه سريع." : "Ask about a service or request quick guidance."}
                </div>
              </div>
            )}

            {/* FAQ quick chips */}
            {faqs.length > 0 && messages.length === 0 && (
              <div className="mb-3">
                <div className="mb-2 text-xs font-medium">
                  {locale === "ar" ? "أسئلة شائعة" : "Popular questions"}
                </div>
                <div className="flex flex-wrap gap-2">
                  {faqs.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(f.question)}
                      className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                    >
                      {f.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render message list */}
            <div className="space-y-3">
              {messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <Card className="max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
                      {m.content}
                    </Card>
                  </div>
                ) : (
                  <div key={m.id} className="flex items-start gap-2">
                    <div className={cn("grid h-7 w-7 place-items-center rounded-md text-white", `bg-gradient-to-br ${palette.range}`)}>
                      <Bot className="h-4 w-4" />
                    </div>
                    <Card className="max-w-[80%] rounded-2xl px-3 py-2 text-sm">
                      <div className="prose prose-sm dark:prose-invert">
                        {asTextNodes(m.content)}
                      </div>
                      {/* Service suggestions under assistant reply */}
                      {services.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {services.map((s, idx) => (
                            <button
                              key={idx}
                              className="rounded-full border px-2.5 py-1 text-[11px] hover:bg-accent"
                              onClick={() =>
                                sendMessage(
                                  (locale === "ar" ? "أخبرني المزيد عن " : "Tell me more about ") + s.name
                                )
                              }
                            >
                              {s.name} • {s.price}
                            </button>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )
              )}
              {busy && (
                <div className="flex items-start gap-2">
                  <div className={cn("grid h-7 w-7 place-items-center rounded-md text-white", `bg-gradient-to-br ${palette.range}`)}>
                    <Bot className="h-4 w-4" />
                  </div>
                  <Card className="max-w-[80%] rounded-2xl px-3 py-2 text-sm">
                    {locale === "ar" ? "جارٍ الكتابة..." : "Typing..."}
                  </Card>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Contact hints */}
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <PhoneCall className="h-3.5 w-3.5" />
                <span>{site?.phone || "+20-106-245-3344"}</span>
              </div>
              {contact?.whatsapp && (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" />
                  <a
                    className="text-primary underline"
                    href={buildWhatsApp("General", "N/A", locale, site?.name || "KYCtrust")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {contact.whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="border-t p-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
            >
              <Input
                placeholder={locale === "ar" ? "اكتب رسالتك..." : "Type your message..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={busy || !input.trim()}
                className={cn(`bg-gradient-to-r ${palette.range} text-white`)}
              >
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
