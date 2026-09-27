-- Migration 007: Add SECURITY DEFINER RPC for public membership application submission
--
-- Problem: Direct .insert() on membership_applications table is blocked by RLS policy.
-- The table's RLS denies anon/public insert, requiring a SECURITY DEFINER wrapper
-- to bypass RLS using table-owner permissions (analogous to event registration model).
--
-- Solution: Create insert_membership_application_manual() RPC with:
-- - SECURITY DEFINER to run with table-owner permissions
-- - SET search_path = public to isolate search path
-- - Accepts only form-submitted fields
-- - Returns only the created ID (no participant data exposed)
-- - No email sending (membership submission workflow is manual, like registrations)
-- - anon-only EXECUTE privilege (no PUBLIC, no authenticated)

CREATE OR REPLACE FUNCTION insert_membership_application_manual(
  first_name_param TEXT,
  last_name_param TEXT,
  email_param TEXT,
  phone_param TEXT DEFAULT NULL,
  telegram_id_param TEXT DEFAULT NULL,
  additional_info_param TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_application_id BIGINT;
BEGIN
  -- Insert membership application with status='new' for manual review model
  -- Server validates form fields and data format
  -- No automatic emails, no verification tokens
  -- Admin reviews and manually confirms/rejects
  -- Errors (duplicate email, constraints) propagate to caller unchanged
  INSERT INTO membership_applications (
    first_name,
    last_name,
    email,
    phone,
    telegram_id,
    additional_info,
    status
  ) VALUES (
    first_name_param,
    last_name_param,
    email_param,
    phone_param,
    telegram_id_param,
    additional_info_param,
    'new'
  )
  RETURNING id INTO new_application_id;

  RETURN new_application_id;
END;
$$;

-- Privilege model: anon EXECUTE only, no PUBLIC/authenticated access
REVOKE ALL ON FUNCTION insert_membership_application_manual(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION insert_membership_application_manual(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM authenticated;

GRANT EXECUTE ON FUNCTION insert_membership_application_manual(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon;
