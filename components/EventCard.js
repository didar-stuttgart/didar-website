import Link from 'next/link';
import { t, formatDate, formatTime } from '@/lib/i18n';

export default function EventCard({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const getTitle = () => event[`title_${currentLang}`] || event.title_de;
  const getLocation = () => event[`location_${currentLang}`] || event.location_de;

  return (
    <Link href={`/veranstaltungen/${event.slug}`}>
      <article className="event-card" dir={dir}>
        {/* Event Image Section */}
        <div className="event-image">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={getTitle()}
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="event-image-placeholder">🎭</div>
          )}
        </div>

        {/* Event Content Section */}
        <div className="event-content">
          <div className="event-date">
            📅 {formatDate(event.event_date || event.date, currentLang)}
          </div>

          <h3 className="event-title">{getTitle()}</h3>

          <div className="event-location">
            📍 {getLocation() || t('events.location_tbd', currentLang)}
          </div>

          {event.event_time && (
            <div className="event-time" style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              ⏰ {formatTime(event.event_time || event.time, currentLang)}
            </div>
          )}

          <a href={`/veranstaltungen/${event.slug}`} className="event-link">
            {t('common.learn_more', currentLang)} →
          </a>
        </div>
      </article>
    </Link>
  );
}
