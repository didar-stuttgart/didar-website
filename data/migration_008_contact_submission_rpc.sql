-- Migration 008: Add SECURITY DEFINER RPC for public contact form submission
--
-- Problem: Direct .insert() on contact_submissions table is blocked by missing table grants.
-- The anon/public role has no access to this table, even at PostgreSQL privilege level.
-- Rather than blindly granting SELECT/INSERT to anon on the table (exposing all submissions
-- to direct queries), we use a SECURITY DEFINER wrapper to provide controlled access.
--
-- Solution: Create insert_contact_submission_manual() RPC with:
-- - SECURITY DEFINER to run with table-owner permissions
-- - SET search_path = public to isolate search path
-- - Accepts only form-submitted fields
-- - Returns only the created ID (no submission data exposed)
-- - anon-only EXECUTE privilege (preserves privacy)

CREATE OR REPLACE FUNCTION insert_contact_submission_manual(
  name_param TEXT,
  email_param TEXT,
  message_param TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_submission_id BIGINT;
BEGIN
  -- Insert contact form submission with status='new' for manual review
  -- Server validates form fields and data format
  -- Admin reviews and manually responds
  -- Errors propagate to caller unchanged
  INSERT INTO contact_submissions (
    name,
    email,
    message
  ) VALUES (
    name_param,
    email_param,
    message_param
  )
  RETURNING id INTO new_submission_id;

  RETURN new_submission_id;
END;
$$;

-- Privilege model: anon EXECUTE only, no PUBLIC/authenticated access
REVOKE ALL ON FUNCTION insert_contact_submission_manual(
  TEXT, TEXT, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION insert_contact_submission_manual(
  TEXT, TEXT, TEXT
) FROM authenticated;

GRANT EXECUTE ON FUNCTION insert_contact_submission_manual(
  TEXT, TEXT, TEXT
) TO anon;
