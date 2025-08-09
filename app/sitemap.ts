import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const now = new Date().toISOString()

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/admin`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/dashboard`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ]
  return pages
}
