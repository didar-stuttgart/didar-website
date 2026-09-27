import { validateSession } from './session-store-db.js';

/**
 * Parse cookies from request headers
 */
export function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  const parsed = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
  return parsed;
}

/**
 * Middleware to check admin session
 * Returns true if session is valid, false otherwise
 * Catches any exceptions and treats them as invalid session (returns false)
 */
export async function requireAdminSession(req, res) {
  try {
    const cookies = parseCookies(req);
    const sessionToken = cookies?.session_token;

    if (!sessionToken) {
      return false;
    }

    const isValid = await validateSession(sessionToken);
    return isValid;
  } catch (err) {
    return false;
  }
}
