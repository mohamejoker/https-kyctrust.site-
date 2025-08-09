-- v6_audit_logs.sql
-- Centralized audit logging for critical tables.

BEGIN;

CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  ts          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor       TEXT NOT NULL DEFAULT CURRENT_USER,
  table_name  TEXT NOT NULL,
  op          TEXT NOT NULL CHECK (op IN ('INSERT','UPDATE','DELETE')),
  row_id      TEXT,
  diff        JSONB
);

CREATE OR REPLACE FUNCTION audit_row()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  before_row JSONB;
  after_row  JSONB;
  delta      JSONB;
  rid        TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    before_row := to_jsonb(OLD);
    after_row := NULL;
    rid := COALESCE(OLD.id::text, OLD.key::text, NULL);
  ELSIF (TG_OP = 'INSERT') THEN
    before_row := NULL;
    after_row := to_jsonb(NEW);
    rid := COALESCE(NEW.id::text, NEW.key::text, NULL);
  ELSE
    before_row := to_jsonb(OLD);
    after_row := to_jsonb(NEW);
    rid := COALESCE(NEW.id::text, NEW.key::text, NULL);
  END IF;

  delta := jsonb_build_object(
    'before', before_row,
    'after', after_row
  );

  INSERT INTO audit_logs(table_name, op, row_id, diff)
  VALUES (TG_TABLE_NAME, TG_OP, rid, delta);

  IF (TG_OP = 'DELETE') THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END$$;

-- Attach audit triggers to critical tables if they exist.
DO $$
BEGIN
  IF to_regclass('public.settings') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_settings') THEN
      CREATE TRIGGER trg_audit_settings
        AFTER INSERT OR UPDATE OR DELETE ON settings
        FOR EACH ROW EXECUTE FUNCTION audit_row();
    END IF;
  END IF;

  IF to_regclass('public.content_snapshots') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_content_snapshots') THEN
      CREATE TRIGGER trg_audit_content_snapshots
        AFTER INSERT OR UPDATE OR DELETE ON content_snapshots
        FOR EACH ROW EXECUTE FUNCTION audit_row();
    END IF;
  END IF;

  IF to_regclass('public.reviews') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_reviews') THEN
      CREATE TRIGGER trg_audit_reviews
        AFTER INSERT OR UPDATE OR DELETE ON reviews
        FOR EACH ROW EXECUTE FUNCTION audit_row();
    END IF;
  END IF;

  IF to_regclass('public.users') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_users') THEN
      CREATE TRIGGER trg_audit_users
        AFTER INSERT OR UPDATE OR DELETE ON users
        FOR EACH ROW EXECUTE FUNCTION audit_row();
    END IF;
  END IF;
END $$;

-- Recent audits convenience view
CREATE OR REPLACE VIEW v_audit_recent AS
SELECT *
FROM audit_logs
ORDER BY ts DESC
LIMIT 1000;

-- Helpful partial index for audits by table and time
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_ts ON audit_logs (table_name, ts DESC);

COMMIT;
