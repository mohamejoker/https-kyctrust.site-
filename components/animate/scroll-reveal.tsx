"use client"

import { motion, useReducedMotion } from "framer-motion"
import React from "react"

export function ScrollReveal({
  children,
  delay = 0,
  y = 14,
  once = true,
  className,
  as = "div",
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  once?: boolean
  className?: string
  as?: keyof JSX.IntrinsicElements
}) {
  const prefersReduced = useReducedMotion()
  const MotionTag: any = motion[as] || motion.div

  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y }
  const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 }

  return (
    <MotionTag
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once, amount: 0.2 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        delay,
      }}
    >
      {children}
    </MotionTag>
  )
}
