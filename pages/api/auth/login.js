/**
 * Admin login endpoint
 * Validates admin password and creates a session
 *
 * IMPORTANT: The admin password hash is stored in the database or environment
 * In Phase 1, we use environment variables for simplicity
 * Later phases should use a more robust solution
 */

import { verifyPassword, generateSessionToken, createSession } from '@/lib/admin-auth';
import { validateRequired } from '@/lib/validation';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    // Validate input
    if (!validateRequired(password, 1, 500)) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check if password hash is configured
    if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH === 'will-be-generated-during-setup') {
      return res.status(500).json({
        error: 'Admin password not configured. Run setup first.',
      });
    }

    // Verify password
    if (!verifyPassword(password, ADMIN_PASSWORD_HASH)) {
      // Don't reveal whether the password is wrong or not configured
      // Just return 401
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate session token
    const token = generateSessionToken();
    createSession(token);

    // Set session cookie (HTTP-only for security)
    res.setHeader('Set-Cookie', [
      `admin_session=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Strict; Secure`,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
