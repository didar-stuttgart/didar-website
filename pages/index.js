/**
 * Homepage
 * Path: /
 * Displays welcome section and categorized event carousels
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

    // Filter to only public-safe fields and limit to 12 per category for homepage
    const recurringEvents = filterPublicEvents(recurring.slice(0, 12));
    const upcomingEvents = filterPublicEvents(upcoming.slice(0, 12));
    const pastEvents = filterPublicEvents(past.slice(0, 12));

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

export default function Home({ recurringEvents, upcomingEvents, pastEvents, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{currentLang === 'fa' ? 'دیدار' : 'Didar'} - {t('home.title', currentLang)}</title>
      </Head>

      {/* Hero / Welcome Section */}
      <section className="section hero" dir={dir}>
        <div className="container">
          <h1>{t('home.welcome', currentLang)}</h1>
          <p>{t('home.description', currentLang)}</p>
        </div>
      </section>

      {/* Events Sections */}
      <section className="section events-homepage" dir={dir}>
        <div className="container">
          {/* Recurring Events */}
          {recurringEvents.length > 0 && (
            <div className="events-category">
              <div className="events-category-header">
                <h2>{t('events.recurring', currentLang)}</h2>
                <a href={`/${currentLang === 'fa' ? 'fa/' : ''}veranstaltungen`} className="btn btn-text">
                  {t('events.all_events', currentLang)} →
                </a>
              </div>
              <EventCarousel events={recurringEvents} currentLang={currentLang} />
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="events-category">
              <div className="events-category-header">
                <h2>{t('events.upcoming', currentLang)}</h2>
                <a href={`/${currentLang === 'fa' ? 'fa/' : ''}veranstaltungen`} className="btn btn-text">
                  {t('events.all_events', currentLang)} →
                </a>
              </div>
              <EventCarousel events={upcomingEvents} currentLang={currentLang} />
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="events-category">
              <div className="events-category-header">
                <h2>{t('events.past', currentLang)}</h2>
                <a href={`/${currentLang === 'fa' ? 'fa/' : ''}veranstaltungen`} className="btn btn-text">
                  {t('events.all_events', currentLang)} →
                </a>
              </div>
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
