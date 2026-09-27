-- Migration 005: SECURITY DEFINER RPC for manual registration model
-- Creates a narrowly scoped function to insert registrations with status='new'
-- This bypasses RLS restrictions while maintaining security through:
-- 1. SECURITY DEFINER ensures it runs with table owner permissions
-- 2. Server-side validation is required before calling
-- 3. Function only accepts the minimum required parameters
-- 4. Returns only the registration ID, not sensitive data
-- 5. REVOKE ALL ensures PUBLIC role cannot execute this function

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
EXCEPTION WHEN OTHERS THEN
  -- Return NULL on error (let caller handle)
  RETURN NULL;
END;
$$;

-- CRITICAL: Explicitly revoke PUBLIC EXECUTE before granting to anon
REVOKE ALL ON FUNCTION insert_event_registration_manual(
  BIGINT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

-- Grant EXECUTE to anon role so public registration endpoint can call it
GRANT EXECUTE ON FUNCTION insert_event_registration_manual(
  BIGINT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon;
