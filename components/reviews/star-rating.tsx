"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function Stars({
  value,
  outOf = 5,
  size = 16,
  className,
}: {
  value: number
  outOf?: number
  size?: number
  className?: string
}) {
  const full = Math.floor(value)
  const frac = value - full
  const items = Array.from({ length: outOf }, (_, i) => i)
  return (
    <div className={cn("inline-flex items-center", className)} aria-label={`Rating ${value} of ${outOf}`}>
      {items.map((i) => {
        const filled = i < full
        const half = i === full && frac >= 0.25 && frac < 0.75
        const cls = filled || half ? "text-amber-500" : "text-muted-foreground/40"
        return (
          <Star
            key={i}
            className={cn(cls)}
            style={{ width: size, height: size, fill: filled ? "currentColor" : "none" }}
          />
        )
      })}
    </div>
  )
}

export function StarsInput({
  value,
  onChange,
  outOf = 5,
}: {
  value: number
  onChange: (v: number) => void
  outOf?: number
}) {
  const items = Array.from({ length: outOf }, (_, i) => i + 1)
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Select rating">
      {items.map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          onClick={() => onChange(i)}
          className="group"
          title={`${i} stars`}
        >
          <Star
            className={value >= i ? "text-amber-500" : "text-muted-foreground/40 group-hover:text-amber-500"}
            style={{ width: 20, height: 20 }}
          />
        </button>
      ))}
    </div>
  )
}
