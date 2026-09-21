/**
 * Event data filtering utilities
 *
 * Separates public-safe fields from admin-only fields.
 * Used to prevent exposure of admin_notes and other internal data
 * to public browsers and API responses.
 */

/**
 * Fields that are safe to send to public browsers/APIs.
 * All other fields are admin-only and must be stripped.
 */
const PUBLIC_EVENT_FIELDS = [
  'id',
  'slug',
  'created_at',
  'updated_at',
  'title_fa',
  'title_de',
  'description_fa',
  'description_de',
  'event_date',
  'event_time',
  'location_fa',
  'location_de',
  'capacity',
  'registration_deadline',
  'image_url',
  'status',
  'registration_status',
  'registration_open', // Legacy field, kept for backward compat
  'category',
  'category_fa',
  'category_de',
  'event_language',
  'event_language_fa',
  'event_language_de',
  'external_registration_url',
];

/**
 * Filters an event object to only include public-safe fields.
 * Removes admin_notes and any other admin-only data.
 *
 * @param {Object} event - Full event object from database
 * @returns {Object} Filtered event object safe for public exposure
 */
export function filterPublicEvent(event) {
  if (!event) {
    return null;
  }

  const filtered = {};

  PUBLIC_EVENT_FIELDS.forEach(field => {
    if (field in event) {
      filtered[field] = event[field];
    }
  });

  return filtered;
}

/**
 * Filters an array of events to only include public-safe fields.
 *
 * @param {Array} events - Array of event objects from database
 * @returns {Array} Array of filtered events safe for public exposure
 */
export function filterPublicEvents(events) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events.map(filterPublicEvent);
}
