-- Admin Sessions RLS Configuration
-- Implements Row Level Security for the admin_sessions table
-- Prevents public anonymous access to admin session tokens
-- Safe to run multiple times (uses IF NOT EXISTS and DO block)

-- 1. Create admin_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id TEXT NOT NULL
);

-- 2. Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token_hash ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);

-- 3. Enable Row Level Security on admin_sessions table
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create policy to deny all public/anonymous access
-- This prevents unauthenticated users from reading, inserting, updating, or deleting admin sessions
-- Uses DO block because PostgreSQL does not support CREATE POLICY IF NOT EXISTS
DO $$
BEGIN
  -- Check if the policy already exists by querying pg_policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
      AND tablename = 'admin_sessions' 
      AND policyname = 'admin_sessions_deny_public'
  ) THEN
    CREATE POLICY admin_sessions_deny_public
    ON admin_sessions
    FOR ALL
    TO public
    USING (false)
    WITH CHECK (false);
  END IF;
END $$;

-- Note: Service role (backend) can still access this table because service role
-- bypasses RLS policies entirely. This is intentional - admin session management
-- should only be done through the backend with proper authentication checks.
