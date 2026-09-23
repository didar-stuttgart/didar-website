-- Registration Verification Implementation
-- Adds email verification workflow to event registrations
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS)

-- 1. Add verification columns to event_registrations table
ALTER TABLE event_registrations
ADD COLUMN IF NOT EXISTS verification_token_hash TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Update status enum to include 'pending' and 'verified'
-- First, drop the existing constraint if it exists
ALTER TABLE event_registrations
DROP CONSTRAINT IF EXISTS event_registrations_status_check;

-- Then add the new constraint with updated values
ALTER TABLE event_registrations
ADD CONSTRAINT event_registrations_status_check
CHECK (status IN ('pending', 'verified', 'new', 'contacted', 'confirmed', 'declined'));

-- 3. Set default status to 'pending' for new registrations
ALTER TABLE event_registrations
ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Create indexes for query optimization
CREATE INDEX IF NOT EXISTS idx_registrations_token_expires
ON event_registrations(verification_token_expires_at)
WHERE verification_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_verified
ON event_registrations(verified_at)
WHERE status = 'verified';

-- 5. Helper function to count verified registrations
CREATE OR REPLACE FUNCTION count_verified_registrations(event_id_param BIGINT)
RETURNS BIGINT AS $$
  SELECT COUNT(*) FROM event_registrations
  WHERE event_id = event_id_param 
    AND status = 'verified' 
    AND verified_at IS NOT NULL
$$ LANGUAGE SQL STABLE;
