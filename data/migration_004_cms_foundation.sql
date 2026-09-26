-- Migration 004: CMS Foundation (Phase 3A)
-- Date: 2026-09-26
-- Implements: cms_content and organization_settings tables
-- Safety: Fully backward compatible; does not delete or modify existing content table
--
-- This migration creates the new CMS infrastructure without affecting existing
-- event registration, membership, or contact systems. The old `content` table
-- remains for rollback safety but is not used by new code.
--
-- Schema follows the finalized CMS_ARCHITECTURE.md and enforces:
-- - Bilingual content (content_fa, content_de required)
-- - Non-technical admin safety (no JSON editing)
-- - RLS security (public read, admin write only via authenticated app)

-- ============================================================================
-- TABLE 1: cms_content
-- ============================================================================
-- Stores all user-facing editorial content (pages, sections, items).
-- Key-based identification: homepage.hero.title, about.story.content, etc.
-- Bilingual with enforced parity (both _fa and _de required).

CREATE TABLE IF NOT EXISTS cms_content (
  -- Identification
  id BIGSERIAL PRIMARY KEY,

  -- Unique human-readable key (e.g., "homepage.hero.title")
  -- Composite structure: [page].[section].[item]
  -- Examples: homepage.hero.title, about.story.content, privacy_policy.section_1.content
  key TEXT UNIQUE NOT NULL,

  -- Metadata for admin UI organization
  -- Allows filtering/navigation: "Show all items from 'homepage' page"
  page TEXT NOT NULL,          -- "homepage", "about", "membership", "contact", "privacy_policy", "impressum", "footer"
  section TEXT NOT NULL,       -- "hero", "story", "section_1", "managers", etc.
  item_type TEXT NOT NULL,     -- "title", "content", "description", etc.

  -- Content editor type (determines which UI component to show in admin)
  content_type TEXT NOT NULL
    CHECK (content_type IN ('text', 'textarea', 'rich_text')),

  -- Bilingual Content (REQUIRED and NOT NULL enforced)
  -- All content must exist in both Persian and German
  content_fa TEXT NOT NULL,    -- Persian content
  content_de TEXT NOT NULL,    -- German content

  -- Admin interface
  admin_label TEXT NOT NULL,   -- Human-readable label for admin panel ("Hero Title", "About Story")
  admin_help TEXT,             -- Optional tooltip for admins ("This appears in the hero section", etc.)

  -- Ordering (for repeatable sections like legal text with 12+ sections)
  -- Sections are displayed in sort_order to maintain structure
  sort_order INT DEFAULT 0,    -- 0, 1, 2, 3, ... (1 for 1st legal section, 2 for 2nd, etc.)

  -- Enable/disable without deleting
  -- Useful for testing/staging: can disable old content without data loss
  is_enabled BOOLEAN DEFAULT TRUE,

  -- Safety/audit flags
  is_locked BOOLEAN DEFAULT FALSE,  -- Prevents accidental edits on critical content (legal pages)

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Future: audit trail (Phase 3B+)
  created_by TEXT,             -- Admin email (e.g., "admin@didar.de")
  updated_by TEXT              -- Admin email
);

-- Indexes for efficient queries
CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_content_key ON cms_content(key);
CREATE INDEX IF NOT EXISTS idx_cms_content_page ON cms_content(page);
CREATE INDEX IF NOT EXISTS idx_cms_content_page_section ON cms_content(page, section);
CREATE INDEX IF NOT EXISTS idx_cms_content_enabled ON cms_content(is_enabled);
CREATE INDEX IF NOT EXISTS idx_cms_content_updated ON cms_content(updated_at DESC);

-- ============================================================================
-- TABLE 2: organization_settings
-- ============================================================================
-- Stores centralized organization/infrastructure data:
-- - Contact information (email, phone, address)
-- - Team members (managers, founders, etc.)
-- - Social media links and external URLs
--
-- Unlike cms_content (editorial), these are structured/configuration items
-- that non-technical admins edit via forms (not markdown).
-- Stored as JSON but never edited as raw JSON by admins.

CREATE TABLE IF NOT EXISTS organization_settings (
  id BIGSERIAL PRIMARY KEY,

  -- Unique key identifier
  -- Examples: "contact_email", "contact_phone", "organization_managers", "social_instagram_url"
  key TEXT UNIQUE NOT NULL,

  -- For scalar/simple settings (email, phone, single URL)
  -- Use _fa/_de variants only if the value is bilingual (e.g., address)
  value_text TEXT,             -- Single value (used if not bilingual)
  value_text_fa TEXT,          -- Persian variant (if bilingual)
  value_text_de TEXT,          -- German variant (if bilingual)

  -- For structured data (managers list, etc.)
  -- Stored as JSON but edited via form in admin UI, never as raw JSON
  -- Examples:
  --   managers: [{"id": "mgr_1", "name": "Danial Haghgoo", "role": "Co-founder", "email": "..."}]
  --   social_links: {"instagram": "https://...", "telegram": "https://..."}
  value_json JSONB,

  -- Admin metadata
  admin_label TEXT NOT NULL,   -- Human-readable label ("Contact Email", "Team Members")
  admin_help TEXT,             -- Optional guidance for admins

  -- Indicates whether this setting uses _fa/_de variants
  is_bilingual BOOLEAN DEFAULT FALSE,

  -- Safety
  is_locked BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_by TEXT              -- Admin email
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_settings_key ON organization_settings(key);
CREATE INDEX IF NOT EXISTS idx_organization_settings_updated ON organization_settings(updated_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- Following the established RLS pattern:
-- - Public visitors can READ content
-- - Public visitors CANNOT write/modify
-- - Admin access is SESSION-BASED (checked in app, not RLS)
-- - Admin uses service role key or app-level session check

-- Enable RLS
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CMS_CONTENT RLS Policies
-- ============================================================================

-- Public can READ all enabled content
CREATE POLICY "cms_public_read_enabled" ON cms_content
  FOR SELECT
  USING (is_enabled = true);

-- Block all public writes
-- Admin writes are done via app-level session check + service role key
CREATE POLICY "cms_block_public_insert" ON cms_content
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "cms_block_public_update" ON cms_content
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "cms_block_public_delete" ON cms_content
  FOR DELETE
  TO anon
  USING (false);

-- ============================================================================
-- ORGANIZATION_SETTINGS RLS Policies
-- ============================================================================

-- Public can READ all settings
CREATE POLICY "settings_public_read" ON organization_settings
  FOR SELECT
  USING (true);

-- Block all public writes
CREATE POLICY "settings_block_public_insert" ON organization_settings
  FOR INSERT
  TO anon
  WITH CHECK (false);

CREATE POLICY "settings_block_public_update" ON organization_settings
  FOR UPDATE
  TO anon
  USING (false);

CREATE POLICY "settings_block_public_delete" ON organization_settings
  FOR DELETE
  TO anon
  USING (false);

-- ============================================================================
-- EXPLICIT GRANTS (Security)
-- ============================================================================
-- Revoke all by default, then grant specific permissions

-- Anon user: Can only read enabled content and settings (via SELECT policies)
REVOKE ALL ON TABLE cms_content FROM anon;
GRANT SELECT ON TABLE cms_content TO anon;

REVOKE ALL ON TABLE organization_settings FROM anon;
GRANT SELECT ON TABLE organization_settings TO anon;

-- Authenticated user: Same as anon (no special access)
-- Admin writes are done via service role key or app-level session check
REVOKE ALL ON TABLE cms_content FROM authenticated;
GRANT SELECT ON TABLE cms_content TO authenticated;

REVOKE ALL ON TABLE organization_settings FROM authenticated;
GRANT SELECT ON TABLE organization_settings TO authenticated;

-- ============================================================================
-- SEED DATA (Test/Demo Records Only)
-- ============================================================================
-- These are clearly identifiable test records to verify schema and functionality.
-- NOT production content. Production migration happens in Phase 3B.

INSERT INTO cms_content (key, page, section, item_type, content_type, content_fa, content_de, admin_label, admin_help, sort_order, is_enabled)
VALUES
  -- Homepage test records
  ('homepage.hero.title', 'homepage', 'hero', 'title', 'text', '[TEST] دیدار', '[TEST] Didar Stuttgart', 'Hero Title', 'Main title in hero section', 0, true),
  ('homepage.hero.subtitle', 'homepage', 'hero', 'subtitle', 'text', '[TEST] انجمن فرهنگی هنری', '[TEST] Iranische Kulturgemeinschaft', 'Hero Subtitle (Persian only)', 'Subtitle appears only in Persian', 0, true),
  ('homepage.about_card.title', 'homepage', 'about_card', 'title', 'text', '[TEST] درباره دیدار', '[TEST] Über Didar', 'About Card Title', 'Title of about card on homepage', 0, true),
  ('homepage.about_card.description', 'homepage', 'about_card', 'description', 'textarea', '[TEST] متن توصیفی درباره...', '[TEST] Beschreibender Text über Didar...', 'About Card Description', 'Marketing summary for about section', 0, true),

  -- About page test records
  ('about.story.title', 'about', 'story', 'title', 'text', '[TEST] داستان دیدار', '[TEST] Geschichte von Didar', 'Story Title', 'Title of the story section', 0, true),
  ('about.story.content', 'about', 'story', 'content', 'rich_text', '[TEST] # درباره ما\n\nاین داستان...', '[TEST] # Über Uns\n\nDiese Geschichte...', 'Story Content', 'Long-form story with markdown formatting', 0, true),

  -- Legal/Privacy test records
  ('privacy_policy.section_1.title', 'privacy_policy', 'section_1', 'title', 'text', '[TEST] ۱. معرفی', '[TEST] 1. Einleitung', 'Privacy Section 1 Title', 'Title of first section', 1, true),
  ('privacy_policy.section_1.content', 'privacy_policy', 'section_1', 'content', 'rich_text', '[TEST] # معرفی\n\nاین سند...', '[TEST] # Einleitung\n\nDieses Dokument...', 'Privacy Section 1 Content', 'Content with markdown', 1, true),

  -- Footer test record
  ('footer.tagline', 'footer', 'tagline', 'tagline', 'text', '[TEST] انجمن فرهنگی دیدار', '[TEST] Didar Kulturgemeinschaft', 'Footer Tagline', 'Branding text in footer', 0, true)
ON CONFLICT (key) DO NOTHING;

INSERT INTO organization_settings (key, value_text, value_text_fa, value_text_de, admin_label, admin_help, is_bilingual)
VALUES
  -- Scalar settings (non-bilingual)
  ('contact_email', '[TEST] info@test.didar.de', NULL, NULL, 'Contact Email', 'Primary email address', false),
  ('contact_phone', '[TEST] +49 155 11250722', NULL, NULL, 'Contact Phone', 'Phone number for inquiries', false),

  -- Bilingual scalar (address)
  ('contact_address', NULL, '[TEST] آدرس دانشگاه شتوتگارت', '[TEST] Universität Stuttgart, Stuttgart', 'Contact Address', 'Office address', true),

  -- Structured data (managers as JSON)
  ('organization_managers', NULL, NULL, NULL, 'Team Members', 'Edit via form; do not edit JSON directly', false)
ON CONFLICT (key) DO NOTHING;

-- Seed manager data as JSON (structured, but managed via form in admin UI)
UPDATE organization_settings
SET value_json = jsonb_build_array(
  jsonb_build_object(
    'id', 'mgr_1',
    'name', '[TEST] Danial Haghgoo',
    'role', 'Co-founder',
    'email', 'danial@test.didar.de'
  ),
  jsonb_build_object(
    'id', 'mgr_2',
    'name', '[TEST] Sayedali Yarahmadian',
    'role', 'Co-founder',
    'email', 'sayedali@test.didar.de'
  )
)
WHERE key = 'organization_managers';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================
--
-- 1. The existing `content` table is PRESERVED for backward compatibility
--    and rollback safety. New code uses cms_content.
--
-- 2. All test data is clearly marked with [TEST] prefix for easy identification.
--    Production content will be migrated separately in Phase 3B.
--
-- 3. RLS is set up for public READ, admin WRITE via app-level session check.
--    Admin writes require: (1) valid session, (2) service role key
--
-- 4. Seed data uses safe test values:
--    - No production content
--    - Bilingual parity verified (all _fa and _de pairs present)
--    - Keys match the finalized CMS_ARCHITECTURE.md
--
-- 5. This migration is fully backward compatible:
--    - Does not alter existing tables
--    - Does not delete or modify existing content
--    - Existing admin panel still works unchanged
--    - Existing event/membership/contact systems unaffected
--
-- Verification steps (see Phase 3A Verification section):
--   SELECT COUNT(*) FROM cms_content;  -- Should return ~9
--   SELECT COUNT(*) FROM organization_settings;  -- Should return ~4
--   SELECT DISTINCT page FROM cms_content;  -- Should show multiple pages
--   SELECT value_json FROM organization_settings WHERE key = 'organization_managers'; -- Should show managers
