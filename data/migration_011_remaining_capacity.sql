-- Migration 011: Manually-editable "remaining capacity" display field
-- Date: 2026-09-29
--
-- Purpose:
-- Replace the old "حضور: 0/0" (verified-registrations / capacity) display,
-- which was always 0/0 in the manual-registration model because
-- registrations never reach status='verified', with a simple, manually
-- controlled "remaining capacity" number that admins set directly per event.
-- This is purely a display field — it is NOT used to calculate or enforce
-- registration limits (the manual registration model is unchanged).
--
-- Impact on existing data:
-- - All existing events get remaining_capacity = NULL (not shown until an
--   admin sets a value)
-- - No data is deleted or lost
-- - Existing `capacity` column and its semantics are untouched

BEGIN;

ALTER TABLE events ADD COLUMN IF NOT EXISTS remaining_capacity INT;

COMMENT ON COLUMN events.remaining_capacity IS
  'Manually-set number shown publicly as "ظرفیت باقیمانده" / "Verbleibende Plätze". Purely informational; not used for capacity enforcement.';

COMMIT;
