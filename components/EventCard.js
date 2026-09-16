import Link from 'next/link';
import { t, formatDate, formatTime } from '@/lib/i18n';

export default function EventCard({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const getTitle = () => event[`title_${currentLang}`] || event.title_de;
  const getLocation = () => event[`location_${currentLang}`] || event.location_de;

  const statusKey = {
    registration_open: 'events.registration_open',
    registration_closed: 'events.registration_closed',
    past_event: 'events.past_event',
  }[event.status] || 'events.past_event';

  return (
    <Link href={`/veranstaltungen/${event.slug}`}>
      <article className="event-card" dir={dir}>
        <div
          className="event-card-image"
          style={{
            backgroundImage: `url('${event.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          role="img"
          aria-label={getTitle()}
        />

        <div className="event-card-content">
          <time className="event-card-date" dateTime={event.date}>
            {formatDate(event.date, currentLang)}
          </time>

          <h3 className="event-card-title">{getTitle()}</h3>

          <time className="event-card-time" dateTime={`2026-01-01T${event.time}`}>
            ⏰ {formatTime(event.time, currentLang)}
          </time>

          {getLocation() && <div className="event-card-location">📍 {getLocation()}</div>}

          <span className="event-card-status">{t(statusKey, currentLang)}</span>
        </div>
      </article>
    </Link>
  );
}
