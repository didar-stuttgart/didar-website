/**
 * Events Listing Page
 * Path: /veranstaltungen
 * Displays upcoming and past events from Supabase
 */

import Head from 'next/head';
import EventCard from '@/components/EventCard';
import { t } from '@/lib/i18n';
import { createServerClient } from '@/lib/supabase';
import { filterPublicEvents } from '@/lib/events-filter';

export async function getStaticProps() {
  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch upcoming events directly from Supabase
    const { data: upcomingEvents, error: upcomingError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (upcomingError) {
      console.error('Error fetching upcoming events:', upcomingError);
    }

    // Fetch past events directly from Supabase
    const { data: pastEvents, error: pastError } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .lt('event_date', today)
      .order('event_date', { ascending: false });

    if (pastError) {
      console.error('Error fetching past events:', pastError);
    }

    // Filter to only public-safe fields, removing admin_notes and other admin-only data
    const filteredUpcoming = filterPublicEvents(upcomingEvents);
    const filteredPast = filterPublicEvents(pastEvents);

    return {
      props: {
        upcomingEvents: filteredUpcoming,
        pastEvents: filteredPast,
      },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        upcomingEvents: filterPublicEvents([]),
        pastEvents: filterPublicEvents([]),
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
        <title>{t('events.title', currentLang)} - {currentLang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('events.title', currentLang)}</h1>

          <h2 className="mt-12">{t('events.upcoming', currentLang)}</h2>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-3 mt-8">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} currentLang={currentLang} isPast={false} />
              ))}
            </div>
          ) : (
            <p className="mt-8">{t('events.no_upcoming', currentLang)}</p>
          )}

          {pastEvents.length > 0 && (
            <>
              <h2 className="mt-16">{t('events.past', currentLang)}</h2>
              <div className="grid grid-3 mt-8">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} isPast={true} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
