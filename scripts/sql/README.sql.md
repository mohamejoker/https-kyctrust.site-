# Database Finalization (No App Changes Required)

This folder contains idempotent SQL migrations to complete your project’s data layer: reviews, moderation, auditing, publishing, snapshots, rollback, performance indexes, export helpers, and optional Supabase-friendly RPCs. You can run them in order on your existing Postgres (Neon). No code or redeploy required.

Order:
1. v5_reviews.sql
2. v6_audit_logs.sql
3. v7_snapshots_and_functions.sql
4. v8_seed_default_content.sql
5. v9_performance_indexes.sql
6. v10_security_policies.sql
7. v11_export_helpers.sql
8. v12_supabase_ready.sql (optional, for Supabase-friendly RPCs)

All scripts are safe to re-run.

What you get:
- Reviews system with moderation and public views:
  - Table: reviews
  - Views: v_reviews_public, v_reviews_stats
  - Insert by public, approve/reject by admin (RLS policies included)
- Auditing (audit_logs) on settings, reviews, content_snapshots
- Atomic publish and rollback:
  - fn_publish_content(payload JSONB)
  - fn_snapshot_content(locale, content)
  - fn_rollback_snapshot(snapshot_id)
- Seeds: default published_content so pages don’t break on blank DB
- Performance: tuned indexes on frequent queries
- Export helpers: JSON/CSV via pure SQL
- Supabase-ready: roles anon/authenticated and RPCs to smooth future use of Supabase Studio

Notes on Supabase
- If you later decide to migrate to Supabase Postgres, these policies and RPCs match common Supabase patterns (anon/authenticated roles, RPC invocation). You can paste these SQL files into the Supabase SQL Editor to provision the same schema and policies.
- Your application can keep using the current DB; Supabase adoption is optional and does not require code changes upfront.

Environment Variables (FYI)
- If you add/change environment variables in Vercel, they apply only to new deployments — redeploy to take effect [^4].
- Manage env vars via your project’s Settings → Environment Variables [^1][^3].
- Public variables must be prefixed with NEXT_PUBLIC_ to be accessible in the browser; never put secrets in NEXT_PUBLIC_ [^1][^3].

Operations
- Publish new content:
  SELECT fn_publish_content('{"ar": {...}, "en": {...}, "design": {...}}'::jsonb);
- Rollback to snapshot:
  SELECT fn_rollback_snapshot(<snapshot_id>);
- Export:
  SELECT * FROM fn_export_reviews_json();
  SELECT * FROM fn_export_snapshots_json();
  SELECT fn_export_analytics_csv();

Security
- RLS is enabled on settings, reviews, and content_snapshots.
- Roles created: app_admin, app_editor, app_viewer, plus Supabase-compatible anon, authenticated.

Troubleshooting
- If GIN on JSONB is restricted on your plan, the script ignores that index gracefully.
- All triggers use IF NOT EXISTS guards to remain idempotent.
