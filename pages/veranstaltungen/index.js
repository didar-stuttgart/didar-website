/**
 * Events Listing Page
 * Path: /veranstaltungen
 * Displays recurring, upcoming, and past events in horizontal carousels
 */

import Head from 'next/head';
import EventCarousel from '@/components/EventCarousel';
import { t } from '@/lib/i18n';
import { createServerClient } from '@/lib/supabase';
import { filterPublicEvents } from '@/lib/events-filter';
import { categorizeEvents } from '@/lib/events-categorizer';

export async function getStaticProps() {
  try {
    const supabase = createServerClient();

    // Fetch all published events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return {
        props: {
          recurringEvents: [],
          upcomingEvents: [],
          pastEvents: [],
        },
        revalidate: 300,
      };
    }

    // Categorize events
    const { recurring, upcoming, past } = categorizeEvents(events || []);

    // Filter to only public-safe fields (no limit on listing page)
    const recurringEvents = filterPublicEvents(recurring);
    const upcomingEvents = filterPublicEvents(upcoming);
    const pastEvents = filterPublicEvents(past);

    return {
      props: {
        recurringEvents,
        upcomingEvents,
        pastEvents,
      },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (error) {
    console.error('Error fetching events:', error);
    return {
      props: {
        recurringEvents: [],
        upcomingEvents: [],
        pastEvents: [],
      },
      revalidate: 300,
    };
  }
}

export default function Events({ recurringEvents, upcomingEvents, pastEvents, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('events.title', currentLang)} - {currentLang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section events-full-list" dir={dir}>
        <div className="container">
          <h1>{t('events.title', currentLang)}</h1>

          {currentLang === 'de' && (
            <p className="mt-4" style={{ color: 'var(--color-text-muted)' }}>
              {t('events.language_notice_de', currentLang)}
            </p>
          )}

          {/* Recurring Events */}
          {recurringEvents.length > 0 && (
            <div className="events-category mt-12">
              <h2>{t('events.recurring', currentLang)}</h2>
              <EventCarousel events={recurringEvents} currentLang={currentLang} />
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="events-category mt-12">
              <h2>{t('events.upcoming', currentLang)}</h2>
              <EventCarousel events={upcomingEvents} currentLang={currentLang} />
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="events-category mt-12">
              <h2>{t('events.past', currentLang)}</h2>
              <EventCarousel events={pastEvents} currentLang={currentLang} isPast={true} />
            </div>
          )}

          {/* No events message */}
          {recurringEvents.length === 0 && upcomingEvents.length === 0 && pastEvents.length === 0 && (
            <p className="mt-8">{t('events.no_upcoming', currentLang)}</p>
          )}
        </div>
      </section>
    </>
  );
}
