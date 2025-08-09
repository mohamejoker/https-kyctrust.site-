# Changelog

## v1.2
- Added Reviews system (ratings + comments) with moderation (admin approves/rejects).
- Encrypted storage of reviewer emails; IP and UA hashing; submission rate limiting.
- Public Reviews section with animated UI and form, including honeypot anti-bot.
- Admin pages: Dashboard → Reviews (moderation).
- Installer wizard at /install to set dashboard password, site URL, and encrypted AI keys.
- Performance: preconnect hints, short cache for public reviews, skeletons while loading.
- Security: continues to separate NEXT_PUBLIC config from server-only secrets; secrets encrypted at rest.
- Scripts: `scripts/sql/v5_reviews.sql` and `scripts/node/reviews-smoke.ts`.

See docs/INSTALLER.md for first-time setup.
\`\`\`

```plaintext file="docs/INSTALLER.md"
# Installer

Open /install for first-time setup:
1. Set a dashboard password (unlocks admin).
2. Optionally set Site URL (used by sitemap, links).
3. Optionally set AI provider keys (stored encrypted; used by chatbot).

After installation:
- Admin: /admin → /dashboard.
- Secrets: Dashboard → Settings → Secrets.
- Content publishing updates the landing page live.

Environment variable rules:
- NEXT_PUBLIC_* variables are readable on the client. Use them only for non-sensitive values like NEXT_PUBLIC_SITE_URL. [^1]
- Secrets (provider keys, DB URLs) remain on the server and are never exposed to the browser. Use Vercel Project Settings or the in-app Secrets page (encrypted at rest). [^1]
