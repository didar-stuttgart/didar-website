/**
 * Verification Token Utilities
 * Handles secure token generation, hashing, and validation
 * Supports event registration email verification
 */

import crypto from 'crypto';

/**
 * Generate a secure random token
 * Returns a 64-character hex string
 */
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a token using SHA256
 * Used for secure storage in database
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generate token expiration time (24 hours from now)
 */
export function getTokenExpiration() {
  const now = new Date();
  now.setHours(now.getHours() + 24);
  return now.toISOString();
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(expirationTime) {
  return new Date() > new Date(expirationTime);
}
