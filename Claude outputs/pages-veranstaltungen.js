/**
 * Events Listing Page
 * Path: /veranstaltungen
 * Displays upcoming and past events from Supabase
 */

import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch upcoming events
    const upcomingRes = await fetch(`${baseUrl}/api/events?status=upcoming`);
    const upcomingData = upcomingRes.ok ? await upcomingRes.json() : { events: [] };

    // Fetch past events
    const pastRes = await fetch(`${baseUrl}/api/events?status=past`);
    const pastData = pastRes.ok ? await pastRes.json() : { events: [] };

    return {
      props: {
        upcomingEvents: upcomingData.events || [],
        pastEvents: pastData.events || [],
      },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        upcomingEvents: [],
        pastEvents: [],
      },
      revalidate: 300, // Retry after 5 minutes on error
    };
  }
}

function EventCard({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const title = currentLang === 'fa' ? event.title_fa : event.title_de;
  const location = currentLang === 'fa' ? event.location_fa : event.location_de;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(
    currentLang === 'fa' ? 'fa-IR' : 'de-DE',
    { month: 'short', day: 'numeric' }
  );
  const formattedTime = event.time ? event.time.substring(0, 5) : null;

  const statusText = event.registration_status === 'registration_open'
    ? t('events.registration_open', currentLang)
    : event.registration_status === 'registration_closed'
    ? t('events.registration_closed', currentLang)
    : t('events.past_event', currentLang);

  return (
    <Link href={`/veranstaltungen/${event.slug}`}>
      <div className="event-card" dir={dir}>
        {event.image_url && (
          <div className="event-card-image">
            <img src={event.image_url} alt={title} />
          </div>
        )}

        <div className="event-card-content">
          <h3>{title}</h3>

          <div className="event-card-meta mt-4">
            <div className="meta-line">
              <span className="meta-label">{t('event.date', currentLang)}:</span>
              <span>{formattedDate}</span>
            </div>

            {formattedTime && (
              <div className="meta-line">
                <span className="meta-label">{t('event.time', currentLang)}:</span>
                <span>{formattedTime}</span>
              </div>
            )}

            {location && (
              <div className="meta-line">
                <span className="meta-label">{t('event.location', currentLang)}:</span>
                <span>{location}</span>
              </div>
            )}
          </div>

          <div className="event-card-status mt-4">
            <span className={`status-badge status-${event.registration_status}`}>
              {statusText}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage({ upcomingEvents, pastEvents, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('events.title', currentLang)} - DIDAR</title>
        <meta name="description" content={t('events.title', currentLang)} />
      </Head>

      <section className="events-page" dir={dir}>
        <div className="container">
          <h1>{t('events.title', currentLang)}</h1>

          {/* Upcoming Events */}
          <div className="section mt-16">
            <h2>{t('events.upcoming', currentLang)}</h2>

            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="events-grid mt-8">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} />
                ))}
              </div>
            ) : (
              <div className="alert alert-info mt-8">
                {t('events.no_upcoming', currentLang)}
              </div>
            )}
          </div>

          {/* Past Events */}
          {pastEvents && pastEvents.length > 0 && (
            <div className="section mt-16">
              <h2>{t('events.past', currentLang)}</h2>

              <div className="events-grid mt-8">
                {pastEvents.map(event => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
