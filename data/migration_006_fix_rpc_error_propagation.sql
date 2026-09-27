-- Migration 006: Fix error propagation in insert_event_registration_manual()
--
-- Bug: migration_005 wrapped the INSERT in `EXCEPTION WHEN OTHERS THEN RETURN NULL`,
-- which silently swallowed ALL database errors, including the 23505 unique_violation
-- raised by the event_registrations_email_unique constraint on duplicate
-- (event_id, email) registrations.
--
-- Effect of the bug: submit.js already has correct handling for a duplicate
-- error (`insertError.code === '23505'` -> HTTP 409 duplicate_email), but it
-- never received that error: the RPC returned NULL as if nothing went wrong,
-- so submit.js fell through to a generic HTTP 500.
--
-- Fix: remove the blanket exception handler entirely. Errors -- duplicate-key
-- violations and any other database error -- now propagate to the caller
-- unchanged, exactly as an RPC with no EXCEPTION clause behaves by default.
-- No application-level duplicate check is introduced; the database
-- unique constraint remains the sole source of truth for this rule.
--
-- Same exact function signature as migration_005; same security model
-- (SECURITY DEFINER, search_path=public, anon-only EXECUTE). No RLS changes,
-- no table grant changes, no second function created.

CREATE OR REPLACE FUNCTION insert_event_registration_manual(
  event_id_param BIGINT,
  first_name_param TEXT,
  last_name_param TEXT,
  email_param TEXT,
  phone_param TEXT DEFAULT NULL,
  telegram_id_param TEXT DEFAULT NULL,
  comment_param TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_registration_id BIGINT;
BEGIN
  -- Insert the registration with status='new' for manual model
  -- Server validates event exists, is published, registration open, and data is valid
  -- No verification tokens, no email sent, no capacity blocking
  -- No exception handler: database errors (including unique_violation on
  -- duplicate event_id+email) propagate to the caller unchanged.
  INSERT INTO event_registrations (
    event_id,
    first_name,
    last_name,
    email,
    phone,
    telegram_id,
    comment,
    status
  ) VALUES (
    event_id_param,
    first_name_param,
    last_name_param,
    email_param,
    phone_param,
    telegram_id_param,
    comment_param,
    'new'
  )
  RETURNING id INTO new_registration_id;

  RETURN new_registration_id;
END;
$$;

-- Re-assert privilege model unchanged (idempotent; matches migration_005)
REVOKE ALL ON FUNCTION insert_event_registration_manual(
  BIGINT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION insert_event_registration_manual(
  BIGINT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM authenticated;

GRANT EXECUTE ON FUNCTION insert_event_registration_manual(
  BIGINT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon;
