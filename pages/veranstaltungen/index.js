/**
 * Events Listing Page
 * Path: /veranstaltungen
 * Displays upcoming and past events from Supabase
 */

import Head from 'next/head';
import EventCard from '@/components/EventCard';
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

export default function Events({ upcomingEvents, pastEvents, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('events.title', currentLang)} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('events.title', currentLang)}</h1>

          <h2 className="mt-12">{t('events.upcoming', currentLang)}</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-2 mt-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} currentLang={currentLang} />
              ))}
            </div>
          ) : (
            <p className="mt-8">{t('events.no_upcoming', currentLang)}</p>
          )}

          {pastEvents.length > 0 && (
            <>
              <h2 className="mt-16">{t('events.past', currentLang)}</h2>
              <div className="grid grid-2 mt-8">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
