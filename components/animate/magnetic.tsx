"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"

type Props = {
  strength?: number // 0..1
  radius?: number // px influence radius
  className?: string
  children: React.ReactNode
}

/**
 * Magnetic wraps interactive elements (e.g., Buttons) and gently attracts to the cursor.
 * Respects prefers-reduced-motion.
 */
export function Magnetic({ children, strength = 0.15, radius = 120, className }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})
  const reduced = useReducedMotion()

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    const power = Math.max(0, 1 - dist / radius) * strength
    setStyle({ transform: `translate3d(${dx * power}px, ${dy * power}px, 0)` })
  }

  const onLeave = () => {
    if (reduced) return
    setStyle({ transform: "translate3d(0, 0, 0)" })
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      style={{
        willChange: "transform",
        transition: "transform 160ms cubic-bezier(.2,.8,.2,1)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}
