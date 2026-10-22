-- Migration 013: Allow re-registration after cancellation
-- Date: 2026-10-22
--
-- Problem:
-- event_registrations had UNIQUE (event_id, email) (event_registrations_email_unique).
-- Cancelled registrations are kept (status='cancelled', migration 012), so a
-- cancelled row kept occupying the (event_id, email) slot and the person got
-- "already registered" (HTTP 409 duplicate_email) when registering again.
--
-- Fix:
-- Replace the table-wide unique constraint with a PARTIAL unique index that
-- only covers rows that are not cancelled. Consequences:
--   - at most ONE non-cancelled registration per (event_id, email); enforced by
--     the database, so two simultaneous requests cannot both succeed
--     (the loser gets unique_violation 23505 -> HTTP 409 duplicate_email,
--     exactly as before).
--   - any number of cancelled rows per (event_id, email); history is kept.
--   - re-registering inserts a NEW row (new id, new cancellation token hash,
--     status 'new'). The old cancelled row is untouched.
--
-- Not changed: insert_event_registration_manual() (it has no duplicate logic
-- of its own and keeps propagating unique_violation), RLS, grants, other
-- tables, capacity / registration_status behavior, the manual-review model.
--
-- Side effect to know about: an admin who changes a cancelled registration
-- back to an active status while another active registration for the same
-- person and event exists will get a unique_violation (the API answers 409).
--
-- Safe to run: no rows are changed. Existing data already satisfies the
-- partial index because it satisfied the stricter old constraint.
-- Idempotent.

BEGIN;

-- 1. Drop the old unique constraint on exactly (event_id, email), whatever it
--    is called in the live database (schema.sql names it
--    event_registrations_email_unique).
DO $$
DECLARE
  c RECORD;
BEGIN
  FOR c IN
    SELECT con.conname
    FROM pg_constraint con
    WHERE con.conrelid = 'public.event_registrations'::regclass
      AND con.contype = 'u'
      AND (
        SELECT array_agg(att.attname::text ORDER BY att.attname::text)
        FROM unnest(con.conkey) AS k(attnum)
        JOIN pg_attribute att
          ON att.attrelid = con.conrelid AND att.attnum = k.attnum
      ) = ARRAY['email', 'event_id']
  LOOP
    EXECUTE format('ALTER TABLE public.event_registrations DROP CONSTRAINT %I', c.conname);
  END LOOP;
END;
$$;

-- 2. At most one non-cancelled registration per event and email.
--    IS DISTINCT FROM also covers a NULL status (column is nullable).
CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_active_email_unique
  ON public.event_registrations (event_id, email)
  WHERE status IS DISTINCT FROM 'cancelled';

COMMIT;
