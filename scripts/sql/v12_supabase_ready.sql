-- v12_supabase_ready.sql
-- Optional: Supabase-friendly helpers to smooth future adoption without app changes

BEGIN;

-- RPC-like wrappers that mirror typical PostgREST patterns Supabase uses.
-- These allow you (or Supabase Studio) to call functions for moderation
-- without exposing internal table details.

-- Moderate review: set status 'approved' or 'rejected'
CREATE OR REPLACE FUNCTION rpc_moderate_review(p_id BIGINT, p_status TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  IF p_status NOT IN ('approved','rejected') THEN
    RAISE EXCEPTION 'Invalid status %', p_status;
  END IF;

  UPDATE reviews
    SET status = p_status, updated_at = NOW()
    WHERE id = p_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  RETURN TRUE;
END$$;

-- Create review with minimal fields (server-side validation still applies)
CREATE OR REPLACE FUNCTION rpc_create_review(
  p_name TEXT,
  p_rating INT,
  p_comment TEXT,
  p_email_enc TEXT DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL,
  p_ua_hash TEXT DEFAULT NULL
)
RETURNS BIGINT LANGUAGE plpgsql AS $$
DECLARE
  new_id BIGINT;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;

  INSERT INTO reviews(name, email_enc, rating, comment, status, ip_hash, ua_hash)
  VALUES (p_name, p_email_enc, p_rating, p_comment, 'pending', p_ip_hash, p_ua_hash)
  RETURNING id INTO new_id;

  RETURN new_id;
END$$;

-- Read published content (single row) for external tools
CREATE OR REPLACE FUNCTION rpc_get_published()
RETURNS JSONB LANGUAGE sql STABLE AS $$
  SELECT value FROM settings WHERE key = 'published_content' LIMIT 1;
$$;

-- Publish atomically (wraps fn_publish_content)
CREATE OR REPLACE FUNCTION rpc_publish(payload JSONB)
RETURNS BOOLEAN LANGUAGE plpgsql AS $$
BEGIN
  RETURN fn_publish_content(payload);
END$$;

COMMIT;
