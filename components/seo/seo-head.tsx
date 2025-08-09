"use client"

import Head from "next/head"
import { useMemo } from "react"
import { useCMS } from "@/lib/store"

function jsonLd(obj: unknown) {
  try {
    return JSON.stringify(obj)
  } catch {
    return "{}"
  }
}

export function SEOHead() {
  const { locale, content } = useCMS()
  const data = content[locale]
  const siteUrl =
    (typeof process !== "undefined" && (process as any).env?.NEXT_PUBLIC_SITE_URL) ||
    (typeof window !== "undefined" ? window.location.origin : "https://example.com")
  const canonical = siteUrl
  const title = `${data.site.name} — ${data.hero.subtitle || data.site.tagline || ""}`.trim()
  const description = data.site.description || data.hero.description || data.site.tagline
  const logo = data.site.logoSrc || "/generic-brand-logo.png"
  const alternateAr = `${siteUrl}/?lang=ar`
  const alternateEn = `${siteUrl}/?lang=en`

  const organizationLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: data.site.name,
      url: siteUrl,
      logo: `${siteUrl}${logo.startsWith("/") ? logo : `/${logo}`}`,
      sameAs: [],
    }),
    [data.site.name, siteUrl, logo],
  )

  const websiteLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: data.site.name,
      url: siteUrl,
      inLanguage: locale === "ar" ? "ar" : "en",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }),
    [data.site.name, siteUrl, locale],
  )

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={alternateAr} />
      <link rel="alternate" hrefLang="en" href={alternateEn} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="theme-color" content="#101010" media="(prefers-color-scheme: dark)" />
      <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={locale === "ar" ? "ar_AR" : "en_US"} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={data.site.name} />
      {/* A lightweight placeholder preview */}
      <meta
        property="og:image"
        content={`${siteUrl}/placeholder.svg?height=630&width=1200&query=kyctrust%20landing%20preview`}
      />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta
        name="twitter:image"
        content={`${siteUrl}/placeholder.svg?height=630&width=1200&query=kyctrust%20landing%20preview`}
      />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd) }} />
    </Head>
  )
}
