"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="grid min-h-screen place-items-center p-6">
          <div className="max-w-md rounded-lg border bg-card p-6 text-sm">
            <div className="mb-2 font-semibold">Something went wrong</div>
            <div className="mb-4 text-muted-foreground">{error.message || "Unknown error"}</div>
            <button
              onClick={() => reset()}
              className="rounded bg-foreground px-3 py-1 text-background"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
