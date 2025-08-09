"use client"

/**
 * AnimatedGrid renders an ultra-light subtle grid + gradient blobs as a decorative background.
 * Pure CSS, GPU-friendly, very low cost.
 */
export function AnimatedGrid({
  className,
  intensity = 0.06,
}: {
  className?: string
  intensity?: number
}) {
  return (
    <div aria-hidden className={["pointer-events-none absolute inset-0 -z-10 overflow-hidden", className].join(" ")}>
      {/* Moving grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(16,16,16,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(16,16,16,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px, 40px 40px",
          transform: "translate3d(0,0,0)",
          animation: "gridMove 22s linear infinite",
          opacity: intensity,
        }}
      />
      {/* Soft gradient blobs */}
      <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl animate-pulse" />
      <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-violet-400/10 blur-3xl animate-pulse [animation-delay:600ms]" />
      <style jsx>{`
        @keyframes gridMove {
          0% { background-position: 0px 0px, 0px 0px; }
          100% { background-position: 40px 40px, 40px 40px; }
        }
        @media (prefers-color-scheme: dark) {
          div[aria-hidden] > div:first-child {
            background-image:
              linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div[aria-hidden] > div:first-child {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
