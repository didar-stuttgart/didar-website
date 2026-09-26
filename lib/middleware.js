/**
 * Middleware helpers for API routes
 *
 * NOTE (codebase audit, September 2026): nothing in this project currently
 * imports requireAdmin() from this file — every admin API route uses
 * requireAdminSession() from lib/api-middleware.js instead. This file is kept
 * for now in case it's wired up later, and its import below was updated to
 * point at the single real session store (lib/session-store.js) so it stays
 * correct if that happens. If it's still unused after a while, it's safe to
 * delete along with this note.
 */

import { validateSession } from '@/lib/session-store-db';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Require admin authentication
 * Extracts and validates the admin session from cookies
 */
export function requireAdmin(handler) {
  return async (req, res) => {
    const { session_token: sessionToken } = req.cookies;

    if (!sessionToken || !(await validateSession(sessionToken))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Continue to the handler
    return handler(req, res);
  };
}

/**
 * Apply rate limiting to a route
 * Uses IP address as the identifier
 */
export function withRateLimit(handler) {
  return async (req, res) => {
    // Get client IP
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      'unknown';

    const { allowed, retryAfter } = checkRateLimit(ip);

    if (!allowed) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter,
      });
    }

    return handler(req, res);
  };
}

/**
 * Compose multiple middleware
 */
export function compose(...middlewares) {
  return (handler) => {
    return middlewares.reduceRight((current, middleware) => {
      return middleware(current);
    }, handler);
  };
}
