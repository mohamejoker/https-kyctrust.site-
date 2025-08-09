export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), { status: 400 })
    }

    // Simulate server-side processing (store, send email, etc.)
    await new Promise((r) => setTimeout(r, 600))

    return new Response(JSON.stringify({ success: true, message: "Thanks! We'll get back to you soon." }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: "Server error" }), { status: 500 })
  }
}
