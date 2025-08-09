import { setTimeout as sleep } from "node:timers/promises"

async function main() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  console.log("Base:", base)

  // Create review
  console.log("POST /api/reviews")
  const post = await fetch(`${base}/api/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Tester",
      email: "tester@example.com",
      rating: 5,
      comment: "Excellent service! (smoke test)",
      website: "", // honeypot must be empty
    }),
  })
  const pj = await post.json()
  console.log("Created:", pj)

  await sleep(500)

  // List approved (should or not include the new one depending on moderation)
  console.log("GET /api/reviews")
  const list = await fetch(`${base}/api/reviews`)
  const lj = await list.json()
  console.log("Summary:", lj.summary)
  console.log("Items (first 1):", lj.items?.[0])
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
