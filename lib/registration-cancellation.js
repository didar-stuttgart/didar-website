/**
 * Event registration self-cancellation helpers
 *
 * The cancellation credential is a random token. Only its SHA-256 hash is
 * stored in the database (event_registrations.cancellation_token_hash); the
 * raw token exists only inside the cancellation link sent in the registration
 * receipt email. Never log, store or email-to-admin the raw token.
 */

import { randomBytes, createHash } from 'crypto';

// 32 random bytes encoded as base64url => exactly 43 characters [A-Za-z0-9_-]
export const CANCELLATION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function hashCancellationToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function generateCancellationToken() {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashCancellationToken(token) };
}

export function isWellFormedCancellationToken(token) {
  return typeof token === 'string' && CANCELLATION_TOKEN_PATTERN.test(token);
}

/**
 * Canonical site URL: NEXT_PUBLIC_APP_URL when configured (same variable the
 * legacy lib/email.js reads), otherwise the production host.
 */
export function getSiteBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const base = configured && configured.trim() ? configured.trim() : 'https://www.didar-stuttgart.com';
  return base.replace(/\/+$/, '');
}

/**
 * Cancellation page URL. Language follows the site's existing Next.js locale
 * routing: Persian (default locale) has no prefix, German lives under /de.
 * The URL only opens the confirmation page; the cancellation itself is a POST.
 */
export function buildCancellationUrl(token, language) {
  const localePrefix = language === 'fa' ? '' : '/de';
  return `${getSiteBaseUrl()}${localePrefix}/registrations/cancel?token=${encodeURIComponent(token)}`;
}
