import Link from 'next/link';
import { t, formatDate, formatTime } from '@/lib/i18n';
import { getEventImage, hasOwnEventImage } from '@/lib/event-image';

export default function EventCard({ event, currentLang, isPast = false }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const getTitle = () => event[`title_${currentLang}`] || event.title_de;
  const getLocation = () => event[`location_${currentLang}`] || event.location_de;
  const getDescription = () => event[`description_${currentLang}`] || event.description_de;

  const shortDescription = (() => {
    const text = getDescription();
    if (!text) return '';
    return text.length > 120 ? `${text.slice(0, 117)}…` : text;
  })();

  const hasEventDate = Boolean(event.event_date);

  return (
    <Link href={`/veranstaltungen/${event.slug}`} className="event-card-link">
      <div className="event-card" dir={dir}>
        <div className="event-image">
          <img
            src={getEventImage(event)}
            alt={hasOwnEventImage(event) ? getTitle() : ''}
            loading="lazy"
          />
          {event.is_recurring && (
            <div className="recurring-badge">{t('events.recurring_badge', currentLang)}</div>
          )}
        </div>

        <div className="event-info">
          {event.is_recurring ? (
            <div className="event-date-status">
              <span className="date-badge recurring">{t('events.recurring_badge', currentLang)}</span>
            </div>
          ) : hasEventDate ? (
            <div className="event-date-status">
              <span className="date-emoji">📅</span>
              <span className="date-text">{formatDate(event.event_date, currentLang)}</span>
            </div>
          ) : (
            <div className="event-date-status">
              <span className="date-badge">{t('events.coming_soon', currentLang)}</span>
            </div>
          )}

          <h3 className="event-title">{getTitle()}</h3>

          {event.event_time && (
            <div className="event-meta">
              <span>⏰</span>
              <span>{formatTime(event.event_time, currentLang)}</span>
            </div>
          )}

          {getLocation() && (
            <div className="event-meta">
              <span>📍</span>
              <span>{getLocation()}</span>
            </div>
          )}

          {event.registration_status === 'open' && (
            <div className="registration-info">
              {currentLang === 'fa' ? '✓ ثبت‌نام باز است' : '✓ Anmeldung offen'}
            </div>
          )}

          {typeof event.remaining_capacity === 'number' && (
            <div className="event-remaining-capacity" style={{ color: 'var(--color-warning)', fontWeight: 'var(--fw-semibold)' }}>
              {t('event.remaining_capacity', currentLang)}: {event.remaining_capacity}
            </div>
          )}

          <div className="event-more-link">
            {currentLang === 'fa' ? 'بیشتر بدانید ←' : 'Mehr erfahren →'}
          </div>
        </div>
      </div>
    </Link>
  );
}