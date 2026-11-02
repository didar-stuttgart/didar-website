-- Migration 014: Public event-image Storage bucket
-- Date: 2026-11-02
--
-- Purpose:
-- - Create the public-read "event-images" bucket used by the admin upload endpoint.
-- - Keep uploads server-side through the existing Supabase secret-key client.
-- - Do not grant anon/authenticated users upload access.
--
-- IMPORTANT:
-- This migration is NOT applied automatically.
-- Apply it only after reviewing the bucket settings in the target Supabase project.

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'event-images',
  'event-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- No public upload/update/delete policy is created.
-- The application uploads through createAdminClient() with SUPABASE_SECRET_KEY.
