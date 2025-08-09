"use client"

import { motion, useScroll, useSpring } from "framer-motion"
import { useEffect, useState } from "react"

/**
 * ScrollProgress renders a thin progress bar at the top that reflects page scroll position.
 * It respects prefers-reduced-motion by switching to a subtle static bar at 0%.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.2 })
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = () => setReduced(mq.matches)
    handler()
    mq.addEventListener?.("change", handler)
    return () => mq.removeEventListener?.("change", handler)
  }, [])

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent">
      <motion.div
        className="h-full origin-left bg-gradient-to-r from-violet-600 to-emerald-600"
        style={{ scaleX: reduced ? 0 : (scaleX as any) }}
      />
    </div>
  )
}
