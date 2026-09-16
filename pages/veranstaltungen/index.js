import Head from 'next/head';
import EventCard from '@/components/EventCard';
import { t } from '@/lib/i18n';
import mockEvents from '@/data/mockEvents.json';

export default function Events({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  const upcomingEvents = mockEvents
    .filter((e) => e.status !== 'past_event')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = mockEvents
    .filter((e) => e.status === 'past_event')
    .sort((a, b) => new Date(b.date) - new Date(a.date));

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
