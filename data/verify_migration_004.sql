-- Verification Script for Migration 004 (CMS Foundation)
-- Run this after applying the migration to verify everything is correct
-- Results should show: tables exist, constraints work, RLS is active, test data is seeded

-- ============================================================================
-- 1. VERIFY TABLES EXIST
-- ============================================================================

-- Check that both tables exist
SELECT
  tablename,
  EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = tablename
  ) AS exists
FROM (VALUES ('cms_content'), ('organization_settings')) AS t(tablename);

-- Expected output:
-- cms_content | true
-- organization_settings | true

-- ============================================================================
-- 2. VERIFY COLUMN STRUCTURE
-- ============================================================================

-- Check cms_content columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cms_content'
ORDER BY ordinal_position;

-- Expected columns (in order):
-- id | bigint | NO
-- key | text | NO
-- page | text | NO
-- section | text | NO
-- item_type | text | NO
-- content_type | text | NO
-- content_fa | text | NO
-- content_de | text | NO
-- admin_label | text | NO
-- admin_help | text | YES
-- sort_order | integer | YES
-- is_enabled | boolean | YES
-- is_locked | boolean | YES
-- created_at | timestamp with time zone | YES
-- updated_at | timestamp with time zone | YES
-- created_by | text | YES
-- updated_by | text | YES

-- Check organization_settings columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'organization_settings'
ORDER BY ordinal_position;

-- Expected columns (in order):
-- id | bigint | NO
-- key | text | NO
-- value_text | text | YES
-- value_text_fa | text | YES
-- value_text_de | text | YES
-- value_json | jsonb | YES
-- admin_label | text | NO
-- admin_help | text | YES
-- is_bilingual | boolean | YES
-- is_locked | boolean | YES
-- created_at | timestamp with time zone | YES
-- updated_at | timestamp with time zone | YES
-- updated_by | text | YES

-- ============================================================================
-- 3. VERIFY CONSTRAINTS & INDEXES
-- ============================================================================

-- Check unique constraints on cms_content
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cms_content';

-- Expected:
-- cms_content_pkey | PRIMARY KEY
-- cms_content_key_key | UNIQUE

-- Check unique constraints on organization_settings
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'organization_settings';

-- Expected:
-- organization_settings_pkey | PRIMARY KEY
-- organization_settings_key_key | UNIQUE

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('cms_content', 'organization_settings')
ORDER BY tablename, indexname;

-- Expected indexes:
-- cms_content: idx_cms_content_key, idx_cms_content_page, idx_cms_content_page_section, idx_cms_content_enabled, idx_cms_content_updated
-- organization_settings: idx_organization_settings_key, idx_organization_settings_updated

-- ============================================================================
-- 4. VERIFY RLS IS ENABLED
-- ============================================================================

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('cms_content', 'organization_settings');

-- Expected:
-- public | cms_content | true
-- public | organization_settings | true

-- ============================================================================
-- 5. VERIFY RLS POLICIES
-- ============================================================================

-- Check policies on cms_content
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'cms_content'
ORDER BY policyname;

-- Expected policies:
-- cms_block_public_delete | PERMISSIVE | {anon} | DELETE
-- cms_block_public_insert | PERMISSIVE | {anon} | INSERT
-- cms_block_public_update | PERMISSIVE | {anon} | UPDATE
-- cms_public_read_enabled | PERMISSIVE | {} | SELECT

-- Check policies on organization_settings
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'organization_settings'
ORDER BY policyname;

-- Expected policies:
-- settings_block_public_delete | PERMISSIVE | {anon} | DELETE
-- settings_block_public_insert | PERMISSIVE | {anon} | INSERT
-- settings_block_public_update | PERMISSIVE | {anon} | UPDATE
-- settings_public_read | PERMISSIVE | {} | SELECT

-- ============================================================================
-- 6. VERIFY TEST DATA WAS SEEDED
-- ============================================================================

-- Count cms_content records
SELECT COUNT(*) as cms_content_count FROM cms_content;

-- Expected: 9 test records
-- Output should show: cms_content_count | 9

-- Show all cms_content keys (should all start with [TEST])
SELECT key, page, section, is_enabled FROM cms_content ORDER BY key;

-- Expected (all marked [TEST]):
-- homepage.hero.title | homepage | hero | true
-- homepage.hero.subtitle | homepage | hero | true
-- homepage.about_card.title | homepage | about_card | true
-- homepage.about_card.description | homepage | about_card | true
-- about.story.title | about | story | true
-- about.story.content | about | story | true
-- privacy_policy.section_1.title | privacy_policy | section_1 | true
-- privacy_policy.section_1.content | privacy_policy | section_1 | true
-- footer.tagline | footer | tagline | true

-- Count organization_settings records
SELECT COUNT(*) as settings_count FROM organization_settings;

-- Expected: 4 test records
-- Output should show: settings_count | 4

-- Show all organization_settings keys
SELECT key, admin_label, is_bilingual FROM organization_settings ORDER BY key;

-- Expected:
-- contact_address | Contact Address | true
-- contact_email | Contact Email | false
-- contact_phone | Contact Phone | false
-- organization_managers | Team Members | false

-- Verify bilingual content parity (all _fa and _de must be present together)
SELECT
  key,
  content_fa IS NOT NULL AS has_fa,
  content_de IS NOT NULL AS has_de,
  (content_fa IS NOT NULL AND content_de IS NOT NULL) AS bilingual_parity
FROM cms_content
ORDER BY key;

-- Expected: All should have bilingual_parity = true

-- Verify manager list structure (should be valid JSON)
SELECT
  key,
  value_json,
  jsonb_array_length(value_json) as manager_count
FROM organization_settings
WHERE key = 'organization_managers';

-- Expected: Should show 2 managers with id, name, role, email fields

-- ============================================================================
-- 7. VERIFY BACKWARD COMPATIBILITY
-- ============================================================================

-- Confirm old content table still exists and is unchanged
SELECT COUNT(*) as old_content_count FROM content;

-- Expected: Should return the count of existing content rows (usually 1)

SELECT * FROM content;

-- Expected: Original content table data should be intact

-- ============================================================================
-- 8. VERIFY SECURITY: PUBLIC CANNOT WRITE
-- ============================================================================

-- NOTE: These are logical checks, not executable as normal user
-- Run as anon user to verify:

-- This should FAIL (public cannot insert):
-- INSERT INTO cms_content (key, page, section, item_type, content_type, content_fa, content_de, admin_label, is_enabled)
-- VALUES ('test.public.write', 'test', 'test', 'test', 'text', 'test', 'test', 'test', true);
-- Expected: ERROR: new row violates row-level security policy

-- This should SUCCEED (public can read):
-- SELECT * FROM cms_content WHERE is_enabled = true LIMIT 1;
-- Expected: Returns test records

-- ============================================================================
-- 9. SUMMARY CHECK
-- ============================================================================

-- Single query to verify everything is in place
SELECT
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'cms_content') AS cms_content_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'organization_settings') AS organization_settings_exists,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'cms_content') AS cms_content_policies,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'organization_settings') AS organization_settings_policies,
  (SELECT COUNT(*) FROM cms_content) AS cms_content_records,
  (SELECT COUNT(*) FROM organization_settings) AS organization_settings_records,
  (SELECT COUNT(*) FROM content) AS old_content_records;

-- Expected output:
-- cms_content_exists | organization_settings_exists | cms_content_policies | organization_settings_policies | cms_content_records | organization_settings_records | old_content_records
-- 1                 | 1                             | 4                    | 4                              | 9                  | 4                            | 1 (or more)

-- ============================================================================
-- CLEANUP (Optional)
-- ============================================================================
-- To remove test data and start fresh for Phase 3B production migration:
--
-- DELETE FROM cms_content WHERE key LIKE '%[TEST]%' OR key LIKE '% [TEST]%';
-- DELETE FROM organization_settings WHERE admin_label LIKE '%[TEST]%';
--
-- This will preserve the table structure and RLS policies while clearing test records.
