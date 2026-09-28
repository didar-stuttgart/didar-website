import Link from 'next/link';
import { t, formatDate, formatTime } from '@/lib/i18n';
import { SOCIAL_LINKS } from '@/components/SocialIcons';

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
    return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  })();

  return (
    <Link href={`/veranstaltungen/${event.slug}`} className="event-card-link">
      <div className="event-card" dir={dir}>
        {/* Event Image Section */}
        <div className="event-image">
          <img
            src={event.image_url || getFallbackEventImage(event)}
            alt={event.image_url ? getTitle() : ''}
            loading="lazy"
          />
          {event.is_recurring && (
            <div className="recurring-badge">{t('events.recurring_badge', currentLang)}</div>
          )}
        </div>

        {/* Event Info Section */}
        <div className="event-info">
          {/* Date/Status */}
          <div className="event-date-status">
            {event.is_recurring ? (
              <span className="date-badge recurring">{t('events.recurring_badge', currentLang)}</span>
            ) : (
              <>
                <span className="date-emoji">📅</span>
                <span className="date-text">
                  {event.event_date
                    ? formatDate(event.event_date, currentLang)
                    : currentLang === 'fa'
                      ? 'تاریخ به زودی اعلام می‌شود'
                      : 'Termin folgt'}
                </span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="event-title">{getTitle()}</h3>

          {/* Time */}
          {event.event_time && (
            <div className="event-meta">
              <span>⏰</span>
              <span>{formatTime(event.event_time, currentLang)}</span>
            </div>
          )}

          {/* Location */}
          {getLocation() && (
            <div className="event-meta">
              <span>📍</span>
              <span>{getLocation()}</span>
            </div>
          )}

          {/* Registration Info */}
          {event.registration_status === 'open' && (
            <div className="registration-info">
              {currentLang === 'fa' ? '✓ ثبت‌نام باز است' : '✓ Anmeldung offen'}
            </div>
          )}

          {/* More Info Link */}
          <div className="event-more-link">
            {currentLang === 'fa' ? 'بیشتر بدانید ←' : 'Mehr erfahren →'}
          </div>
        </div>
      </div>
    </Link>
  );
}
