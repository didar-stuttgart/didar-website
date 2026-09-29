/**
 * Single source of truth for "which image represents this event".
 *
 * Both EventCard (homepage and /veranstaltungen) and the event detail page
 * must resolve an event's image the same way, so that changing an event's
 * image_url in one place (the Admin editor) updates every representation of
 * that event consistently. Neither component should hard-code its own
 * image path or its own fallback logic.
 */

// Curated, generic event photos (public/images/event-1.jpg … event-5.jpg)
// used only as a fallback when an event has no image_url of its own, so
// nothing ever falls back to a bare emoji or blank box. Picked
// deterministically from the event's own id/slug, so the same event always
// shows the same fallback image rather than a different one on every render.
const FALLBACK_EVENT_IMAGES = [
  '/images/event-1.jpg',
  '/images/event-2.jpg',
  '/images/event-3.jpg',
  '/images/event-4.jpg',
  '/images/event-5.jpg',
];

function getFallbackEventImage(event) {
  const key = String(event.id ?? event.slug ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_EVENT_IMAGES[hash % FALLBACK_EVENT_IMAGES.length];
}

/**
 * Canonical image to display for an event: its own image_url if set,
 * otherwise a deterministic fallback. Use this everywhere an event image is
 * rendered instead of reading event.image_url directly.
 */
export function getEventImage(event) {
  return event?.image_url || getFallbackEventImage(event || {});
}

/**
 * Whether the event has its own image (as opposed to a generic fallback) —
 * useful for deciding alt text.
 */
export function hasOwnEventImage(event) {
  return Boolean(event?.image_url);
}
