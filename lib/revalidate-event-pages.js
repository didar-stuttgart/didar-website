/**
 * Revalidate public event pages after an Admin event mutation.
 *
 * The public homepage and event listing use longer-lived ISR than the
 * individual event page. Explicitly invalidating them after a successful
 * Admin mutation keeps all public representations on the same saved
 * events.image_url snapshot.
 */
export async function revalidateEventPages(res, slugs = []) {
  if (typeof res?.revalidate !== 'function') {
    console.warn('ISR revalidation is unavailable for this response.');
    return;
  }

  const paths = new Set([
    '/',
    '/veranstaltungen',
    ...slugs
      .filter(Boolean)
      .map((slug) => `/veranstaltungen/${encodeURIComponent(slug)}`),
  ]);

  await Promise.all(
    Array.from(paths).map(async (path) => {
      try {
        await res.revalidate(path);
      } catch (error) {
        // Revalidation failure must not roll back a successful Admin mutation.
        console.error(`Failed to revalidate public event page ${path}:`, error);
      }
    })
  );
}
