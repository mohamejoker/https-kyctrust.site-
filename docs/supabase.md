Supabase integration overview

Environment variables
- Client (browser)
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
- Server (API)
  - SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY

Behavior
- If Supabase envs are present, API routes use Supabase for reads/writes.
- If missing, the app falls back to Neon via POSTGRES_URL automatically.
- Client-accessible variables must start with NEXT_PUBLIC_. Never expose secret keys in the client [^1].

Setup
1) Create a Supabase project.
2) Open SQL editor and run scripts/sql/v12_supabase.sql.
3) Add the env vars above in your hosting control panel. No redeploy is needed for data changes, but env var changes require a redeploy to be applied to new builds [^1].
4) Optional: sign in to Supabase Studio to manage content, users, and reviews directly without changing code.

Checks
- GET /api/integrations/supabase/status → {"enabled": true, "ok": true} when configured.
- Use Supabase Studio to moderate reviews and update the settings "published_content".
