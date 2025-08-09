import { randomBytes, createCipheriv, createDecipheriv, createHash } from "node:crypto"

const ALG = "aes-256-gcm"
const IV_LEN = 12 // GCM recommended nonce length
const SEP = ":" // separator for iv:ciphertext:tag

function getKey(): Buffer {
  const material =
    process.env.STACK_SECRET_SERVER_KEY || process.env.POSTGRES_PASSWORD || "fallback-insecure-key-change-in-vercel"
  // Derive a 32-byte key using SHA-256
  return createHash("sha256").update(String(material)).digest()
}

export function encryptJSON(value: unknown): string {
  const key = getKey()
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALG, key, iv)
  const plaintext = Buffer.from(JSON.stringify(value), "utf8")
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  // Compose iv:ciphertext:tag (all base64)
  return [iv.toString("base64"), enc.toString("base64"), tag.toString("base64")].join(SEP)
}

export function decryptJSON(payload: string): any {
  if (!payload || typeof payload !== "string") return null
  const [ivB64, dataB64, tagB64] = payload.split(SEP)
  if (!ivB64 || !dataB64 || !tagB64) throw new Error("Malformed secret payload")
  const key = getKey()
  const iv = Buffer.from(ivB64, "base64")
  const data = Buffer.from(dataB64, "base64")
  const tag = Buffer.from(tagB64, "base64")
  const decipher = createDecipheriv(ALG, key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return JSON.parse(dec.toString("utf8"))
}

export function mask(val?: string | null) {
  if (!val) return ""
  if (val.length <= 6) return "*".repeat(val.length)
  return `${val.slice(0, 3)}***${val.slice(-2)}`
}
