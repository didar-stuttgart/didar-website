import Head from 'next/head';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import { t } from '@/lib/i18n';
import mockEvents from '@/data/mockEvents.json';

export default function Home({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  // Get upcoming events (first 2)
  const upcomingEvents = mockEvents
    .filter((e) => new Date(e.date) >= new Date() && e.status !== 'past_event')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2);

  return (
    <>
      <Head>
        <title>{t('home.title', currentLang)} - DIDAR</title>
        <meta name="description" content={t('home.subtitle', currentLang)} />
        <meta property="og:title" content={t('home.title', currentLang)} />
        <meta property="og:description" content={t('home.subtitle', currentLang)} />
        <meta property="og:type" content="website" />
      </Head>

      <section className="section section--hero" dir={dir}>
        <div className="container">
          <h1 className="hero-title">{t('home.title', currentLang)}</h1>
          <p className="hero-subtitle">{t('home.subtitle', currentLang)}</p>
          <div className="hero-cta">
            <Link href="/ueber-uns" className="btn btn-primary">
              {t('home.hero_cta', currentLang)}
            </Link>
          </div>
        </div>
      </section>

      <section className="section" dir={dir}>
        <div className="container">
          <h2>{t('home.upcoming_events', currentLang)}</h2>
          {upcomingEvents.length > 0 ? (
            <>
              <div className="grid grid-2 mt-8">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} />
                ))}
              </div>
              <div className="mt-8">
                <Link href="/veranstaltungen" className="btn btn-secondary">
                  {t('home.all_events', currentLang)}
                </Link>
              </div>
            </>
          ) : (
            <p className="mt-8">{t('events.no_upcoming', currentLang)}</p>
          )}
        </div>
      </section>

      <section className="section" dir={dir} style={{ backgroundColor: 'var(--color-off-white)' }}>
        <div className="container">
          <h2>{t('home.about_section', currentLang)}</h2>
          <p className="mt-8" style={{ fontSize: 'var(--fs-lg)' }}>
            {t('home.about_text', currentLang)}
          </p>
          <Link href="/ueber-uns" className="btn btn-tertiary mt-8">
            {t('common.learn_more', currentLang)}
          </Link>
        </div>
      </section>

      <section className="section" dir={dir}>
        <div className="container">
          <h2>{t('home.membership_section', currentLang)}</h2>
          <p className="mt-8" style={{ fontSize: 'var(--fs-lg)' }}>
            {t('home.membership_text', currentLang)}
          </p>
          <Link href="/mitglied-werden" className="btn btn-primary mt-8">
            {t('home.membership_cta', currentLang)}
          </Link>
        </div>
      </section>
    </>
  );
}
