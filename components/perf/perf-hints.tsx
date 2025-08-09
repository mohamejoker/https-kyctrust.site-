"use client"

import Head from "next/head"

export function PerfHints() {
  return (
    <Head>
      {/* Preconnects */}
      <link rel="preconnect" href="https://wa.me" />
      {/* Favicon and manifest hooks if needed later */}
      <meta name="color-scheme" content="light dark" />
      {/* Opt in to better mobile tap highlights */}
      <meta name="format-detection" content="telephone=no" />
    </Head>
  )
}
