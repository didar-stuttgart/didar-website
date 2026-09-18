import Link from 'next/link';
import { t, formatDate, formatTime } from '@/lib/i18n';

// Curated, generic event photos (public/images/event-1.jpg … event-5.jpg)
// used only as a fallback when an event has no image_url of its own, so
// cards never fall back to a bare emoji. Picked deterministically from the
// event's own id/slug, so the same event always shows the same fallback
// image rather than a different one on every render.
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

export default function EventCard({ event, currentLang, isPast = false }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const getTitle = () => event[`title_${currentLang}`] || event.title_de;
  const getLocation = () => event[`location_${currentLang}`] || event.location_de;
  const getDescription = () => event[`description_${currentLang}`] || event.description_de;
  const getCategory = () => event[`category_${currentLang}`] || event.category;
  const getLanguage = () => event[`event_language_${currentLang}`] || event.event_language;

  const shortDescription = (() => {
    const text = getDescription();
    if (!text) return '';
    return text.length > 120 ? `${text.slice(0, 117)}\u2026` : text;
  })();

  return (
    <Link href={`/veranstaltungen/${event.slug}`}>
      <article className="event-card" dir={dir}>
        {/* Event Image Section */}
        <div className="event-image">
          <img
            src={event.image_url || getFallbackEventImage(event)}
            alt={event.image_url ? getTitle() : ''}
            loading="lazy"
            onError={(e) => {
              e.target.src = getFallbackEventImage(event);
            }}
          />
        </div>

        {/* Event Content Section */}
        <div className="event-content">
          <div className="event-date">
            📅 {formatDate(event.event_date || event.date, currentLang)}
          </div>

          {getCategory() && <div className="event-category">{getCategory()}</div>}

          <h3 className="event-title">{getTitle()}</h3>

          {shortDescription && <p className="event-description">{shortDescription}</p>}

          {!isPast && event.registration_open === false && (
            <span
              className="badge"
              style={{
                display: 'inline-block',
                alignSelf: 'flex-start',
                background: 'var(--color-sand, #D4C4B0)',
                color: 'var(--color-text, #333)',
                borderRadius: 'var(--radius-sm, 4px)',
                padding: '0.15rem 0.6rem',
                fontSize: 'var(--fs-sm, 0.85rem)',
                marginBottom: '0.5rem',
              }}
            >
              {t('events.coming_soon', currentLang)}
            </span>
          )}

          <div className="event-location">
            📍 {getLocation() || t('events.location_tbd', currentLang)}
          </div>

          {event.event_time && (
            <div className="event-time" style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              ⏰ {formatTime(event.event_time || event.time, currentLang)}
            </div>
          )}

          {getLanguage() && (
            <div className="event-language" style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              {t('events.language', currentLang)}: {getLanguage()}
            </div>
          )}

          <a href={`/veranstaltungen/${event.slug}`} className="event-link">
            {t('common.learn_more', currentLang)} {currentLang === 'fa' ? '←' : '→'}
          </a>
        </div>
      </article>
    </Link>
  );
}
