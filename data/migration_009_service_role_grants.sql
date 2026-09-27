-- Database Permissions for Service Role Backend Access
-- Grants service_role SELECT permission on tables that backend code needs to query
-- Applied: 2026-09-27
--
-- Context: The admin authentication system (lib/session-store-db.js) queries
-- the admin_sessions table using createAdminClient() which operates as service_role.
-- The admin registrations endpoint queries event_registrations. These require
-- explicit SELECT permission on service_role.

-- Allow service_role to SELECT from admin_sessions (for session validation)
GRANT SELECT ON TABLE public.admin_sessions TO service_role;

-- Allow service_role to SELECT from event_registrations (for admin panel queries)
GRANT SELECT ON TABLE public.event_registrations TO service_role;

-- Allow service_role to SELECT from events (for enrichment in admin queries)
GRANT SELECT ON TABLE public.events TO service_role;

-- Context: These permissions enable the backend to:
-- 1. Validate admin session tokens during authentication
-- 2. Retrieve registration data for the admin panel
-- 3. Look up event details to enrich admin displays
--
-- These permissions do NOT grant public/anon/authenticated any additional access.
-- RLS policies continue to restrict what each role can see/do.
