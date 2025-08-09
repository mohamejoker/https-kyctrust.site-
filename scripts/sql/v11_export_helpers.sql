-- v11_export_helpers.sql
-- Helpers to export data as JSON or CSV via SQL

BEGIN;

-- Reviews as JSON (approved only)
CREATE OR REPLACE FUNCTION fn_export_reviews_json()
RETURNS SETOF JSONB LANGUAGE sql STABLE AS $$
  SELECT to_jsonb(r)
  FROM (
    SELECT id, name, rating, comment, created_at
    FROM reviews
    WHERE status = 'approved'
    ORDER BY created_at DESC
  ) r;
$$;

-- Content snapshots as JSON
CREATE OR REPLACE FUNCTION fn_export_snapshots_json()
RETURNS SETOF JSONB LANGUAGE sql STABLE AS $$
  SELECT to_jsonb(s)
  FROM (
    SELECT id, locale, content, created_at
    FROM content_snapshots
    ORDER BY created_at DESC
  ) s;
$$;

-- Analytics as CSV string (portable)
CREATE OR REPLACE FUNCTION fn_export_analytics_csv()
RETURNS TEXT LANGUAGE plpgsql STABLE AS $$
DECLARE
  rec RECORD;
  out TEXT := 'day,visitors,leads,orders,conversion_rate' || E'\n';
BEGIN
  FOR rec IN
    SELECT day, visitors, leads, orders, conversion_rate FROM analytics_daily ORDER BY day DESC
  LOOP
    out := out ||
      rec.day::text || ',' ||
      rec.visitors::text || ',' ||
      rec.leads::text || ',' ||
      rec.orders::text || ',' ||
      rec.conversion_rate::text || E'\n';
  END LOOP;

  RETURN out;
END$$;

COMMIT;
