import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local'
  );
}

// Client-side Supabase client
// This uses the publishable key and is safe to use on the client
// Limited by Row Level Security to public operations only
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Server-side client for public forms (registrations, memberships, contact)
// Uses publishable key - only public INSERT operations allowed by RLS
export function createServerClient() {
  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
    },
  });
}

// Admin-only server client (Phase 3+)
// Uses secret key which BYPASSES Row Level Security
// IMPORTANT: Only use after verifying admin session
// DO NOT expose this key to the client
export function createAdminClient() {
  if (!supabaseSecretKey) {
    throw new Error(
      'SUPABASE_SECRET_KEY not configured. ' +
      'Admin operations require secret key in .env. ' +
      'Get it from Supabase: Settings > API > Secret Keys'
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { supabaseUrl, supabasePublishableKey, supabaseSecretKey };
