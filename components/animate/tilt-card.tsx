"use client"

import * as React from "react"
import { useReducedMotion } from "framer-motion"

type Props = {
  maxTilt?: number // degrees
  glare?: boolean
  children: React.ReactNode
  className?: string
}

/**
 * TiltCard adds a gentle 3D tilt on pointer move. It disables itself for reduced motion users.
 */
export function TiltCard({ children, maxTilt = 6, glare = false, className }: Props) {
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (py - 0.5) * -maxTilt
    const ry = (px - 0.5) * maxTilt
    const gx = (px * 100).toFixed(0)
    const gy = (py * 100).toFixed(0)
    setStyle({
      transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`,
      transition: "transform 160ms cubic-bezier(.2,.8,.2,1)",
      ...(glare
        ? {
            // simple glare using radial-gradient
            backgroundImage: `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.12), rgba(255,255,255,0) 40%)`,
            backgroundBlendMode: "screen",
          }
        : {}),
    })
  }

  const onLeave = () => {
    if (reduced) return
    setStyle({
      transform: "perspective(900px) rotateX(0) rotateY(0) translateZ(0)",
      transition: "transform 220ms ease",
    })
  }

  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave} style={style}>
      {children}
    </div>
  )
}
