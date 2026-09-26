/**
 * Database-backed session store using Supabase
 * Persists across server restarts and instances
 * Compatible with serverless deployments
 * Uses the existing admin_sessions schema with token hashing
 */

import crypto from 'crypto';
import { createAdminClient } from './supabase.js';

const ADMIN_USER_ID = 'admin'; // Single-admin system

/**
 * Hash a session token using SHA-256
 * @param {string} token - Raw session token
 * @returns {string} - Hashed token (hex)
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Create a new admin session stored in database
 * @param {string} token - Raw session token (will be hashed before storage)
 * @param {Date} expiresAt - Session expiry time
 * @returns {Promise<boolean>} - Success status
 */
export async function createSession(token, expiresAt = null) {
  const supabase = createAdminClient();
  const expires = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
  const tokenHash = hashToken(token);

  try {
    // Insert session with hashed token
    const { error } = await supabase
      .from('admin_sessions')
      .insert({
        token_hash: tokenHash,
        expires_at: expires.toISOString(),
        user_id: ADMIN_USER_ID,
      });

    if (error) {
      console.error('❌ Failed to create session:', error.message);
      return false;
    }

    console.log('✅ Session created for user:', ADMIN_USER_ID, 'expires at', expires.toISOString());
    return true;
  } catch (err) {
    console.error('❌ Session creation error:', err.message);
    return false;
  }
}

/**
 * Validate an admin session from database
 * @param {string} token - Raw session token to validate (will be hashed for lookup)
 * @returns {Promise<boolean>} - Whether session is valid
 */
export async function validateSession(token) {
  if (!token) {
    console.log('❌ No token provided');
    return false;
  }

  const supabase = createAdminClient();
  const tokenHash = hashToken(token);

  try {
    // Fetch session from database using token hash
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('expires_at')
      .eq('token_hash', tokenHash)
      .eq('user_id', ADMIN_USER_ID)
      .single();

    if (error) {
      console.log('❌ Token not found or invalid');
      return false;
    }

    // Check expiry
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.log('❌ Session expired');
      // Clean up expired session
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('token_hash', tokenHash)
        .catch(() => {}); // Ignore cleanup errors
      return false;
    }

    console.log('✅ Session valid for user:', ADMIN_USER_ID);
    return true;
  } catch (err) {
    console.error('❌ Session validation error:', err.message);
    return false;
  }
}

/**
 * Delete an admin session from database
 * @param {string} token - Raw session token to delete (will be hashed for lookup)
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteSession(token) {
  const supabase = createAdminClient();
  const tokenHash = hashToken(token);

  try {
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('token_hash', tokenHash)
      .eq('user_id', ADMIN_USER_ID);

    if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('❌ Failed to delete session:', error.message);
      return false;
    }

    console.log('🔓 Session deleted for user:', ADMIN_USER_ID);
    return true;
  } catch (err) {
    console.error('❌ Session deletion error:', err.message);
    return false;
  }
}

/**
 * Clean up expired sessions from database
 * @returns {Promise<number>} - Number of sessions deleted
 */
export async function clearExpiredSessions() {
  const supabase = createAdminClient();

  try {
    const now = new Date().toISOString();
    const { count, error } = await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', now);

    if (error) {
      console.error('❌ Failed to clear expired sessions:', error.message);
      return 0;
    }

    if (count > 0) {
      console.log('🧹 Cleared', count, 'expired sessions');
    }
    return count || 0;
  } catch (err) {
    console.error('❌ Cleanup error:', err.message);
    return 0;
  }
}

/**
 * Get total number of active sessions
 * @returns {Promise<number>} - Session count
 */
export async function getSessionCount() {
  const supabase = createAdminClient();

  try {
    const now = new Date().toISOString();
    const { count, error } = await supabase
      .from('admin_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ADMIN_USER_ID)
      .gt('expires_at', now);

    if (error) {
      console.error('❌ Failed to count sessions:', error.message);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('❌ Count error:', err.message);
    return 0;
  }
}
