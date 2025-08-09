"use client"

type Unsub = () => void

const CHANNEL = "kyctrust-updates"
const STORAGE_KEY = "kyctrust-refresh"

export function notifyPublished() {
  try {
    if (typeof window !== "undefined") {
      try {
        const bc = new BroadcastChannel(CHANNEL)
        bc.postMessage({ type: "published", ts: Date.now() })
        bc.close()
      } catch {
        // ignore
      }
      // Fallback for cross-tab
      localStorage.setItem(STORAGE_KEY, String(Date.now()))
    }
  } catch {
    // ignore
  }
}

export function subscribePublished(onPublished: () => void): Unsub {
  let active = true

  // BroadcastChannel
  let bc: BroadcastChannel | null = null
  try {
    bc = new BroadcastChannel(CHANNEL)
    bc.onmessage = (e) => {
      if (!active) return
      if (e?.data?.type === "published") onPublished()
    }
  } catch {
    // ignore
  }

  // localStorage fallback
  const onStorage = (e: StorageEvent) => {
    if (!active) return
    if (e.key === STORAGE_KEY && e.newValue) onPublished()
  }
  window.addEventListener("storage", onStorage)

  return () => {
    active = false
    window.removeEventListener("storage", onStorage)
    try {
      bc?.close()
    } catch {
      // ignore
    }
  }
}
