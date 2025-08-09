import { ensureSchema, getSetting } from "@/lib/schema"
import { sql } from "@/lib/db"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { groq } from "@ai-sdk/groq"
import { deepinfra } from "@ai-sdk/deepinfra"
import { decryptJSON } from "@/lib/secure-store"

// Helper: configure an available provider at runtime using decrypted secrets
async function configureModelFromSecrets() {
  // Try runtime_secrets first
  const raw = (await getSetting("runtime_secrets")) as { payload?: string } | null
  if (raw?.payload) {
    try {
      const secrets = decryptJSON(raw.payload) as {
        providers?: { xaiKey?: string; groqKey?: string; deepinfraKey?: string }
      }
      if (secrets.providers?.xaiKey) process.env.XAI_API_KEY = secrets.providers.xaiKey
      if (secrets.providers?.groqKey) process.env.GROQ_API_KEY = secrets.providers.groqKey
      if (secrets.providers?.deepinfraKey) process.env.DEEPINFRA_API_KEY = secrets.providers.deepinfraKey
    } catch {
      // ignore decryption errors; fall back to env
    }
  }

  if (process.env.XAI_API_KEY) return xai("grok-3")
  if (process.env.GROQ_API_KEY) return groq("llama-3.1-70b-versatile")
  if (process.env.DEEPINFRA_API_KEY) return deepinfra("meta-llama/Meta-Llama-3.1-70B-Instruct")
  throw new Error(
    "No AI provider configured. Add a key in Dashboard → Settings → Secrets or set XAI_API_KEY/GROQ_API_KEY/DEEPINFRA_API_KEY.",
  )
}

type ChatMessage = { role: "user" | "assistant"; content: string }

export async function POST(req: Request) {
  try {
    await ensureSchema()

    const { message, sessionId, userPreferences, history } = (await req.json().catch(() => ({}))) as {
      message?: string
      sessionId?: string
      userPreferences?: { locale?: "ar" | "en"; tone?: "friendly" | "professional" }
      history?: ChatMessage[]
    }

    if (!message || !sessionId) {
      return new Response(JSON.stringify({ error: "Missing message or sessionId" }), { status: 400 })
    }

    // Prepare per-session storage (create session if not exists)
    await sql`
      INSERT INTO chat_sessions (session_id, user_prefs)
      VALUES (${sessionId}, ${JSON.stringify(userPreferences || {})}::jsonb)
      ON CONFLICT (session_id) DO UPDATE SET user_prefs = COALESCE(chat_sessions.user_prefs, '{}'::jsonb) || EXCLUDED.user_prefs
    `

    // Persist the user message
    await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${sessionId}, 'user', ${message})`

    // Load published content for grounding
    const published = (await getSetting("published_content")) as any | null
    const locale: "ar" | "en" = userPreferences?.locale === "en" ? "en" : "ar"
    const bundle = published?.[locale] || null

    // Build lightweight, structured knowledge
    const siteName = bundle?.site?.name || "KYCtrust"
    const phone = bundle?.site?.phone || "+20-106-245-3344"
    const services = Array.isArray(bundle?.services) ? bundle.services.slice(0, 40) : []
    const faqs = Array.isArray(bundle?.faq) ? bundle.faq.slice(0, 40) : []
    const contactCTA = bundle?.contact?.whatsapp || (locale === "ar" ? "تواصل عبر واتساب" : "Contact via WhatsApp")

    const knowledge = `
Site: ${siteName}
Phone: ${phone}

Top Services:
${services.map((s: any, i: number) => `  ${i + 1}. ${s.name} — ${s.price} — ${s.category} :: ${s.description}`).join("\n")}

FAQs:
${faqs.map((f: any, i: number) => `  Q${i + 1}: ${f.question}\n  A: ${f.answer}`).join("\n")}
`.trim()

    // Include last N turns of session history (short-term memory)
    const lastTurns = Array.isArray(history) ? history.slice(-8) : []

    // Compose system prompt to guide the assistant
    const system = `
You are the helpful website assistant for ${siteName}. Be brief, friendly, and accurate.
Ground your answers in the provided knowledge. If the answer is not in the knowledge, infer carefully, keep it helpful, and avoid making up specifics (prices, SLAs) that aren't provided.
Prefer responding in ${locale === "ar" ? "Arabic" : "English"}.

Tasks:
- Answer FAQs clearly.
- Guide users to the right service and next action.
- Offer WhatsApp CTA when it helps: "https://wa.me/201062453344" (keep the message short if suggesting a link).
- Keep responses mobile-friendly and scannable.

Tone preference: ${userPreferences?.tone || "friendly"}
Knowledge:
${knowledge}
`.trim()

    // Build a condensed conversation prompt (role-tagged)
    const conversation = lastTurns
      .map(
        (t) =>
          `${t.role === "user" ? (locale === "ar" ? "المستخدم" : "User") : locale === "ar" ? "المساعد" : "Assistant"}: ${t.content}`,
      )
      .join("\n")

    const prompt = `
${conversation ? conversation + "\n" : ""}${locale === "ar" ? "المستخدم" : "User"}: ${message}
${locale === "ar" ? "المساعد" : "Assistant"}:
`.trim()

    const model = await configureModelFromSecrets()
    const { text } = await generateText({
      model,
      system,
      prompt,
    })

    // Persist assistant reply (for learning and continuity)
    await sql`INSERT INTO chat_messages (session_id, role, content) VALUES (${sessionId}, 'assistant', ${text})`

    return new Response(JSON.stringify({ text }), { status: 200 })
  } catch (e: any) {
    console.error("Assistant error", e)
    return new Response(JSON.stringify({ error: e?.message || "Assistant error" }), { status: 500 })
  }
}
