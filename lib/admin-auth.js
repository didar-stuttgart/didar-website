import crypto from 'crypto';

/**
 * Hash a password using PBKDF2 with SHA256
 * This is a simple, built-in Node.js implementation
 * Do NOT use this for user authentication in production—use bcrypt or argon2
 * This is acceptable for a single admin account setup where the password is set once
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') {
    return false;
  }

  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const inputHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');

  return inputHash === hash;
}

/**
 * Validate that a password meets minimum security requirements
 */
export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a secure session token
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if a session token is valid
 * In Phase 1, tokens are stored in-memory
 * Later phases should use a persistent session store (Redis, database, etc.)
 */
const activeSessions = new Map();

export function createSession(token) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  activeSessions.set(token, { createdAt: new Date(), expiresAt });
}

export function validateSession(token) {
  const session = activeSessions.get(token);
  if (!session) {
    return false;
  }

  if (new Date() > session.expiresAt) {
    activeSessions.delete(token);
    return false;
  }

  return true;
}

export function deleteSession(token) {
  activeSessions.delete(token);
}

export function clearExpiredSessions() {
  const now = new Date();
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
    }
  }
}
