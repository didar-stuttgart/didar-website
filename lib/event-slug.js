/**
 * Event slug validation and normalization shared by admin create/update APIs.
 *
 * Custom slugs are intentionally limited to a single URL path segment.
 * Existing auto-generated slugs are preserved for backward compatibility.
 */

const CUSTOM_SLUG_MAX_LENGTH = 100;

export function normalizeCustomSlug(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function validateCustomSlug(value) {
  const slug = normalizeCustomSlug(value);

  if (!slug) {
    return { valid: false, slug, error: 'Slug cannot be empty.' };
  }

  if (slug.length > CUSTOM_SLUG_MAX_LENGTH) {
    return {
      valid: false,
      slug,
      error: \`Slug must be \${CUSTOM_SLUG_MAX_LENGTH} characters or fewer.\`,
    };
  }

  // One path segment only: Unicode letters/numbers plus hyphen/underscore.
  // No leading/trailing separators, whitespace, slashes, query strings, or fragments.
  if (!/^\p{L}[\p{L}\p{N}_-]{0,98}[\p{L}\p{N}]$/u.test(slug)) {
    return {
      valid: false,
      slug,
      error:
        'Slug must contain only letters, numbers, hyphens, or underscores, and must not start or end with a separator.',
    };
  }

  return { valid: true, slug, error: null };
}

export function generateEventSlug(titleFa) {
  return String(titleFa || '').toLowerCase().replace(/\s+/g, '-');
}

export { CUSTOM_SLUG_MAX_LENGTH };
