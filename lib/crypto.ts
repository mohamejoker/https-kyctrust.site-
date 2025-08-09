export async function sha256Hex(input: string): Promise<string> {
  // Prefer Web Crypto
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder().encode(input)
    const buf = await crypto.subtle.digest("SHA-256", enc)
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")
  }
  // Fallback to node:crypto if available
  try {
    const { createHash } = await import("node:crypto")
    return createHash("sha256").update(input).digest("hex")
  } catch {
    // Last resort (not cryptographically safe if env lacks crypto)
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      hash = (hash << 5) - hash + input.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash).toString(16)
  }
}

export async function hashPassword(pw: string) {
  return sha256Hex(pw)
}

export async function comparePassword(pw: string, stored: string) {
  const h = await sha256Hex(pw)
  return h === stored
}
