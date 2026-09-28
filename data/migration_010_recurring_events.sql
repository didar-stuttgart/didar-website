-- Migration 010: Support for Recurring/Ongoing Events
-- Date: 2026-09-28
--
-- Purpose:
-- Allow events without a specific event_date to represent recurring or ongoing events.
-- Add is_recurring flag to categorize event types.
--
-- Changes:
-- 1. Make event_date nullable (was: NOT NULL)
-- 2. Add is_recurring BOOLEAN DEFAULT FALSE
--
-- Impact on existing data:
-- - All existing events keep their current event_date values
-- - All existing events are marked is_recurring = FALSE (default)
-- - No data is deleted or lost
-- - Existing categorization logic (upcoming/past by date) remains unchanged
-- - Recurring events with NULL date will be filtered separately in application logic

BEGIN;

-- 1. Make event_date nullable
ALTER TABLE events ALTER COLUMN event_date DROP NOT NULL;

-- 2. Add is_recurring column
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

COMMIT;
