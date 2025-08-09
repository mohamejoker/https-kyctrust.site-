"use client"

import React from "react"

export function SimpleLineChart({ data, height = 120 }: { data: { t: string; v: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.v), 1)
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - (d.v / max) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <svg className="w-full" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height }}>
      <polyline points={points} fill="none" stroke="url(#g)" strokeWidth="2" />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
    </svg>
  )
}
