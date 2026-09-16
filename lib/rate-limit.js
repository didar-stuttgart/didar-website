/**
 * Simple in-memory rate limiter for form submissions
 * Prevents spam/abuse on public forms
 * For production with multiple instances, use Redis or similar
 */

const requestMap = new Map();

const RATE_LIMIT_REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || '10', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

/**
 * Check if a request from an IP should be rate limited
 * Returns { allowed: boolean, retryAfter?: number }
 */
export function checkRateLimit(identifier) {
  const now = Date.now();
  const requests = requestMap.get(identifier) || [];

  // Remove old requests outside the window
  const validRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (validRequests.length >= RATE_LIMIT_REQUESTS) {
    // Rate limit exceeded
    const oldestRequest = validRequests[0];
    const retryAfter = Math.ceil((oldestRequest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Add this request
  validRequests.push(now);
  requestMap.set(identifier, validRequests);

  return { allowed: true };
}

/**
 * Clear expired entries from the rate limit map
 * Call periodically to prevent memory leak
 */
export function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, requests] of requestMap.entries()) {
    const validRequests = requests.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
    if (validRequests.length === 0) {
      requestMap.delete(key);
    } else {
      requestMap.set(key, validRequests);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
