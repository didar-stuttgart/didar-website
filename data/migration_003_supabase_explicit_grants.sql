-- Supabase October 30, 2026 Explicit Grant Compatibility
-- Adds explicit GRANT statements for all tables per new Supabase requirements
-- Before October 30, default grants are implicit; after, they must be explicit
-- Safe to run multiple times (uses IF NOT EXISTS patterns)

-- ==========================================
-- EVENTS TABLE GRANTS
-- ==========================================
-- Policy: Public can read published events only (via RLS)
-- Grant: SELECT for public role (restricted by RLS policy)
REVOKE ALL ON TABLE events FROM public, anon, authenticated;
GRANT SELECT ON TABLE events TO public, authenticated;

-- ==========================================
-- EVENT_REGISTRATIONS TABLE GRANTS  
-- ==========================================
-- Policy: Public can INSERT only (no SELECT/UPDATE/DELETE via RLS)
-- Grant: INSERT for anon, USAGE on sequence
REVOKE ALL ON TABLE event_registrations FROM anon, authenticated;
GRANT INSERT ON TABLE event_registrations TO anon;

REVOKE ALL ON SEQUENCE event_registrations_id_seq FROM anon, authenticated;
GRANT USAGE ON SEQUENCE event_registrations_id_seq TO anon;

-- ==========================================
-- MEMBERSHIP_APPLICATIONS TABLE GRANTS
-- ==========================================
-- Policy: Public can INSERT only (no SELECT/UPDATE/DELETE via RLS)
-- Grant: INSERT for anon, USAGE on sequence
REVOKE ALL ON TABLE membership_applications FROM anon, authenticated;
GRANT INSERT ON TABLE membership_applications TO anon;

REVOKE ALL ON SEQUENCE membership_applications_id_seq FROM anon, authenticated;
GRANT USAGE ON SEQUENCE membership_applications_id_seq TO anon;

-- ==========================================
-- CONTACT_SUBMISSIONS TABLE GRANTS
-- ==========================================
-- Policy: Public can INSERT only (no SELECT/UPDATE/DELETE via RLS)
-- Grant: INSERT for anon, USAGE on sequence
REVOKE ALL ON TABLE contact_submissions FROM public, anon, authenticated;
GRANT INSERT ON TABLE contact_submissions TO anon;

REVOKE ALL ON SEQUENCE contact_submissions_id_seq FROM public, anon, authenticated;
GRANT USAGE ON SEQUENCE contact_submissions_id_seq TO anon;

-- ==========================================
-- ADMIN_SESSIONS TABLE GRANTS
-- ==========================================
-- Policy: DENY ALL for public role (admin only, backend managed)
-- Grant: NO permissions for anon/authenticated (service role only)
-- Note: Service role bypasses RLS and can access this table for backend operations
REVOKE ALL ON TABLE admin_sessions FROM public, anon, authenticated;
-- Intentionally no GRANT - only service role can access
-- Service role (backend) can manage admin sessions despite explicit deny in RLS

-- ==========================================
-- HELPER FUNCTIONS - GRANT EXECUTE PERMISSIONS
-- ==========================================
-- Grant EXECUTE on helper functions where appropriate

-- ==========================================
-- SUMMARY OF GRANTS
-- ==========================================
-- events: SELECT for public/authenticated (controlled by RLS policy)
-- event_registrations: INSERT for anon (controlled by RLS policies)
-- membership_applications: INSERT for anon (controlled by RLS policies)
-- contact_submissions: INSERT for anon (controlled by RLS policies)
-- admin_sessions: NO GRANTS (RLS blocks public, service role manages backend)
--
-- All table access is secured by:
-- 1. Explicit REVOKE/GRANT controlling base permissions
-- 2. RLS policies further restricting what each role can do
-- 3. Service role having full access for backend operations
