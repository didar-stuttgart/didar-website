import { validateSession } from './session-store-db.js';

/**
 * Parse cookies from request headers
 */
export function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
}

/**
 * Middleware to check admin session
 */
export async function requireAdminSession(req, res) {
  const cookies = parseCookies(req);
  const sessionToken = cookies?.session_token;

  if (!sessionToken || !(await validateSession(sessionToken))) {
    return false;
  }

  return true;
}
