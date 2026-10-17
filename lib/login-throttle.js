/**
 * Failed-login throttle for the admin login endpoint.
 * In-memory and per server instance (Vercel may run several), so this slows
 * online guessing but is not a hard global limit.
 */
const failures = new Map(); // ip -> { count, first }
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function checkLoginAllowed(id) {
  const now = Date.now();
  const rec = failures.get(id);
  if (!rec) return { allowed: true };
  if (now - rec.first > WINDOW_MS) {
    failures.delete(id);
    return { allowed: true };
  }
  if (rec.count >= MAX_FAILURES) {
    return { allowed: false, retryAfter: Math.ceil((rec.first + WINDOW_MS - now) / 1000) };
  }
  return { allowed: true };
}

export function recordLoginFailure(id) {
  const now = Date.now();
  const rec = failures.get(id);
  if (!rec || now - rec.first > WINDOW_MS) failures.set(id, { count: 1, first: now });
  else rec.count += 1;
  if (failures.size > 5000) {
    for (const [k, v] of failures) if (now - v.first > WINDOW_MS) failures.delete(k);
  }
}

export function clearLoginFailures(id) {
  failures.delete(id);
}
