-- v10_security_policies.sql
-- Roles and Row Level Security (RLS) with Supabase-compatible roles

BEGIN;

-- Create app roles (ignore if exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_admin') THEN
    CREATE ROLE app_admin;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_editor') THEN
    CREATE ROLE app_editor;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_viewer') THEN
    CREATE ROLE app_viewer;
  END IF;

  -- Supabase-compatible roles (optional, for future adoption)
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
END$$;

-- Enable RLS where appropriate
ALTER TABLE IF EXISTS settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS content_snapshots ENABLE ROW LEVEL SECURITY;

-- SETTINGS
-- Viewers/Editors/Admins can read settings
DROP POLICY IF EXISTS p_settings_select_all ON settings;
CREATE POLICY p_settings_select_all ON settings
  FOR SELECT USING (true);

-- Only Editors/Admins can write settings
DROP POLICY IF EXISTS p_settings_update_editors ON settings;
CREATE POLICY p_settings_update_editors ON settings
  FOR UPDATE TO app_editor, app_admin
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS p_settings_insert_admin ON settings;
CREATE POLICY p_settings_insert_admin ON settings
  FOR INSERT TO app_admin
  WITH CHECK (true);

-- REVIEWS
-- Public (anon/authenticated) can insert reviews, but not read unapproved
DROP POLICY IF EXISTS p_reviews_insert_public ON reviews;
CREATE POLICY p_reviews_insert_public ON reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Anyone can select, but only approved rows are visible
DROP POLICY IF EXISTS p_reviews_select_approved ON reviews;
CREATE POLICY p_reviews_select_approved ON reviews
  FOR SELECT USING (status = 'approved');

-- Admin can moderate (update)
DROP POLICY IF EXISTS p_reviews_update_admin ON reviews;
CREATE POLICY p_reviews_update_admin ON reviews
  FOR UPDATE TO app_admin
  USING (true) WITH CHECK (true);

-- CONTENT_SNAPSHOTS
-- Read-only to everyone; writes restricted to editors/admins
DROP POLICY IF EXISTS p_cs_select_all ON content_snapshots;
CREATE POLICY p_cs_select_all ON content_snapshots
  FOR SELECT USING (true);

DROP POLICY IF EXISTS p_cs_insert_editors ON content_snapshots;
CREATE POLICY p_cs_insert_editors ON content_snapshots
  FOR INSERT TO app_editor, app_admin
  WITH CHECK (true);

-- Optional: deny updates/deletes by default (RLS denies if no matching policy)

COMMIT;
