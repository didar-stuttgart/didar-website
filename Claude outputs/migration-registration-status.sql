-- Phase 11 / Item 4: add a real 3-state registration status to events
-- Run this once in the Supabase SQL Editor (Project > SQL Editor > New query > paste > Run).
-- Safe to run even if some events already exist; it does not delete anything.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'not_open'
    CHECK (registration_status IN ('not_open', 'open', 'closed'));

-- Backfill existing rows from the old true/false field.
-- Events that were registration_open = true become 'open'.
-- Everything else becomes 'not_open' (we cannot know from the old data
-- whether a false value meant "not opened yet" or "closed after being open",
-- so we do not guess - the owner can change individual events to 'closed'
-- in the admin panel if that is what they actually mean).
UPDATE events
SET registration_status = CASE WHEN registration_open = true THEN 'open' ELSE 'not_open' END
WHERE registration_status IS NULL OR registration_status = 'not_open';

-- The old registration_open column is left in place (unused by the app going
-- forward) so nothing else that might read it breaks. It can be dropped later
-- once you've confirmed nothing else depends on it.
