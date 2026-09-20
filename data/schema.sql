-- DIDAR Website Schema
-- Minimal schema for event registrations, membership applications, and contact submissions
-- All personal data is minimized and protected with Row Level Security
--
-- MIGRATION NOTE (Sept 2026, Events + Registration Reliability phase):
-- Because every CREATE TABLE below uses IF NOT EXISTS, re-running this file
-- against an existing database does NOT add new columns to a table that
-- already exists. This is exactly how the live `events` table drifted:
-- registration_status (and category/event_language/external_registration_url,
-- used elsewhere in the app) were added to this schema file and to the app
-- code, but never actually run as a migration against production, so the
-- live table silently lacked them. `registration_status` has since been
-- added directly in production via:
--   ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_status TEXT
--     DEFAULT 'not_open' CHECK (registration_status IN ('not_open','open','closed'));
--   UPDATE events SET registration_status = CASE WHEN registration_open
--     THEN 'open' ELSE 'not_open' END;
-- Any future column added here must also be applied to production with an
-- explicit ALTER TABLE, not assumed to appear from this file alone.

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Bilingual content
  title_fa TEXT NOT NULL,
  title_de TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_fa TEXT,
  description_de TEXT,

  -- Event metadata
  event_date DATE NOT NULL,
  event_time TIME,
  location_fa TEXT,
  location_de TEXT,

  -- Status management
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  registration_open BOOLEAN DEFAULT FALSE, -- deprecated, kept for compatibility; use registration_status
  registration_status TEXT DEFAULT 'not_open' CHECK (registration_status IN ('not_open', 'open', 'closed')),

  -- Optional media
  image_url TEXT,

  -- Admin only
  admin_notes TEXT
);

-- Create index on event_date for sorting
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

-- Event registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,

  -- Personal data (minimized)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  telegram_id TEXT,
  comment TEXT,

  -- Admin tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'declined')),
  admin_notes TEXT,

  CONSTRAINT event_registrations_email_unique UNIQUE (event_id, email)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created ON event_registrations(created_at DESC);

-- Membership applications table
CREATE TABLE IF NOT EXISTS membership_applications (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Personal data (minimized)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  telegram_id TEXT,
  additional_info TEXT,

  -- Admin tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'accepted', 'declined')),
  admin_notes TEXT,

  CONSTRAINT membership_applications_email_unique UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_membership_status ON membership_applications(status);
CREATE INDEX IF NOT EXISTS idx_membership_created ON membership_applications(created_at DESC);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),

  -- Personal data (minimized)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Admin tracking
  read BOOLEAN DEFAULT FALSE,

  CONSTRAINT contact_submissions_unique UNIQUE (email, created_at)
);

CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_read ON contact_submissions(read);

-- ROW LEVEL SECURITY
-- Phase 1 Architecture:
-- - Public users can INSERT forms but NOT read/update/delete personal data
-- - Admin authentication is SESSION-BASED (checked in application code)
-- - Supabase uses anon key only (no JWT roles)
-- - RLS prevents accidental public data access
-- - Admin API routes (Phase 3) will check session BEFORE querying, then bypass RLS

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- EVENTS: Public can read only published events
CREATE POLICY "public_read_published_events" ON events
  FOR SELECT
  USING (status = 'published');

-- REGISTRATIONS: Public can INSERT only (no SELECT/UPDATE/DELETE)
-- Public form submissions run as the anonymous Postgres role. Restrict table
-- access to INSERT and permit only generated registration IDs from the sequence.
REVOKE ALL ON TABLE event_registrations FROM anon, authenticated;
GRANT INSERT ON TABLE event_registrations TO anon;

REVOKE ALL ON SEQUENCE event_registrations_id_seq FROM anon, authenticated;
GRANT USAGE ON SEQUENCE event_registrations_id_seq TO anon;

CREATE POLICY "public_insert_event_registrations" ON event_registrations
  TO anon
  FOR INSERT
  WITH CHECK (true);

-- REGISTRATIONS: Block all public SELECT/UPDATE/DELETE
CREATE POLICY "block_public_select_registrations" ON event_registrations
  FOR SELECT
  USING (false);

CREATE POLICY "block_public_update_registrations" ON event_registrations
  FOR UPDATE
  USING (false);

CREATE POLICY "block_public_delete_registrations" ON event_registrations
  FOR DELETE
  USING (false);

-- MEMBERSHIPS: Public can INSERT only (no SELECT/UPDATE/DELETE)
-- The public form uses the publishable key without a signed-in user, so it is
-- executed as the `anon` Postgres role. A BIGSERIAL insert also needs sequence
-- USAGE, but not SELECT (which would reveal the generated identifier).
REVOKE ALL ON TABLE membership_applications FROM anon, authenticated;
GRANT INSERT ON TABLE membership_applications TO anon;

REVOKE ALL ON SEQUENCE membership_applications_id_seq FROM anon, authenticated;
GRANT USAGE ON SEQUENCE membership_applications_id_seq TO anon;

CREATE POLICY "public_insert_membership_applications" ON membership_applications
  TO anon
  FOR INSERT
  WITH CHECK (true);

-- MEMBERSHIPS: Block all public SELECT/UPDATE/DELETE
CREATE POLICY "block_public_select_memberships" ON membership_applications
  FOR SELECT
  USING (false);

CREATE POLICY "block_public_update_memberships" ON membership_applications
  FOR UPDATE
  USING (false);

CREATE POLICY "block_public_delete_memberships" ON membership_applications
  FOR DELETE
  USING (false);

-- CONTACT: Public can INSERT only (no SELECT/UPDATE/DELETE)
CREATE POLICY "public_insert_contact_submissions" ON contact_submissions
  FOR INSERT
  WITH CHECK (true);

-- CONTACT: Block all public SELECT/UPDATE/DELETE
CREATE POLICY "block_public_select_contact" ON contact_submissions
  FOR SELECT
  USING (false);

CREATE POLICY "block_public_update_contact" ON contact_submissions
  FOR UPDATE
  USING (false);

CREATE POLICY "block_public_delete_contact" ON contact_submissions
  FOR DELETE
  USING (false);

-- NOTE ON ADMIN ACCESS (Phase 3+):
-- Admin authentication is SESSION-BASED (checked in application code, not RLS)
-- Admin API routes will:
-- 1. Check admin session token from cookie
-- 2. If valid, use Supabase anon key to query (RLS will block this)
-- 3. Solution: Admin routes must use a separate ADMIN KEY with full access
--
-- For Phase 1 (foundation only), admin tables are protected but inaccessible
-- Phase 3 will implement admin dashboard using a service role key
