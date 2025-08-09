import { redirect } from "next/navigation"

export default function AdminIndex() {
  // Keep the admin entry lightweight: go to dashboard
  redirect("/dashboard")
}
