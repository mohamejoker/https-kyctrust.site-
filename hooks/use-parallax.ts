"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Pos = { x: number; y: number }

export function useParallax(factor = 12) {
  const ref = useRef<HTMLElement | null>(null)
  const [pointer, setPointer] = useState<Pos>({ x: 0, y: 0 })

  const onMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    // normalize to [-1, 1]
    const nx = (px - 0.5) * 2
    const ny = (py - 0.5) * 2
    setPointer({ x: nx, y: ny })
  }, [])

  // For touch devices, also update on touchmove
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handler = (e: TouchEvent) => {
      if (e.touches.length === 0) return
      const t = e.touches[0]
      const rect = el.getBoundingClientRect()
      const px = (t.clientX - rect.left) / rect.width
      const py = (t.clientY - rect.top) / rect.height
      const nx = (px - 0.5) * 2
      const ny = (py - 0.5) * 2
      setPointer({ x: nx, y: ny })
    }
    el.addEventListener("touchmove", handler, { passive: true })
    return () => el.removeEventListener("touchmove", handler)
  }, [])

  // Style helper per item with multiplier
  const styleFor = useCallback(
    (mult = 1) => {
      const dx = pointer.x * factor * mult
      const dy = pointer.y * factor * mult
      return { transform: `translate3d(${dx}px, ${dy}px, 0)` }
    },
    [pointer, factor]
  )

  return { ref, onMove, styleFor }
}

export function useInViewOnce(threshold = 0.15) {
  const ref = useRef<HTMLElement | null>(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setEntered(true)
            obs.unobserve(entry.target)
          }
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, entered }
}
