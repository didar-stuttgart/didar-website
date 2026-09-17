/**
 * Homepage
 * Path: /
 * Shows hero, upcoming events teaser, about, membership CTA
 */

import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch upcoming events (limit to 2-3 for homepage teaser)
    const upcomingRes = await fetch(`${baseUrl}/api/events?status=upcoming`);
    const upcomingData = upcomingRes.ok ? await upcomingRes.json() : { events: [] };

    // Take only first 2-3 events for homepage display
    const featuredEvents = (upcomingData.events || []).slice(0, 3);

    return {
      props: {
        featuredEvents,
      },
      revalidate: 3600, // Regenerate every hour
    };
  } catch (error) {
    console.error('Error fetching featured events:', error);
    return {
      props: {
        featuredEvents: [],
      },
      revalidate: 300, // Retry after 5 minutes on error
    };
  }
}

function EventTeaser({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';
  const title = currentLang === 'fa' ? event.title_fa : event.title_de;
  const location = currentLang === 'fa' ? event.location_fa : event.location_de;

  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString(
    currentLang === 'fa' ? 'fa-IR' : 'de-DE',
    { month: 'short', day: 'numeric' }
  );
  const formattedTime = event.time ? event.time.substring(0, 5) : null;

  return (
    <Link href={`/veranstaltungen/${event.slug}`}>
      <div className="event-teaser" dir={dir}>
        {event.image_url && (
          <div className="event-teaser-image">
            <img src={event.image_url} alt={title} />
          </div>
        )}

        <div className="event-teaser-content">
          <h3>{title}</h3>

          <div className="event-teaser-meta mt-3">
            <div>{formattedDate}{formattedTime && ` · ${formattedTime}`}</div>
            {location && <div>{location}</div>}
          </div>

          <div className="event-teaser-cta mt-4">
            {t('common.learn_more', currentLang)}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home({ featuredEvents, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('home.title', currentLang)} - DIDAR</title>
        <meta name="description" content={t('home.subtitle', currentLang)} />
        <meta property="og:title" content={t('home.title', currentLang)} />
        <meta property="og:description" content={t('home.subtitle', currentLang)} />
      </Head>

      {/* Hero Section */}
      <section className="hero" dir={dir}>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t('home.title', currentLang)}</h1>
            <p className="hero-subtitle">{t('home.subtitle', currentLang)}</p>

            <Link href="/ueber-uns" className="btn btn-primary mt-8">
              {t('home.hero_cta', currentLang)}
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {featuredEvents && featuredEvents.length > 0 && (
        <section className="upcoming-events" dir={dir}>
          <div className="container">
            <div className="section-header">
              <h2>{t('home.upcoming_events', currentLang)}</h2>
              <Link href="/veranstaltungen" className="link">
                {t('home.all_events', currentLang)} →
              </Link>
            </div>

            <div className="events-teaser-grid mt-12">
              {featuredEvents.map(event => (
                <EventTeaser key={event.id} event={event} currentLang={currentLang} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="about-teaser" dir={dir}>
        <div className="container">
          <h2>{t('home.about_section', currentLang)}</h2>
          <p className="mt-6">{t('home.about_text', currentLang)}</p>

          <Link href="/ueber-uns" className="link mt-6">
            {t('common.learn_more', currentLang)} →
          </Link>
        </div>
      </section>

      {/* Membership CTA Section */}
      <section className="membership-cta" dir={dir}>
        <div className="container">
          <h2>{t('home.membership_section', currentLang)}</h2>
          <p className="mt-6">{t('home.membership_text', currentLang)}</p>

          <Link href="/mitglied-werden" className="btn btn-secondary mt-8">
            {t('home.membership_cta', currentLang)}
          </Link>
        </div>
      </section>
    </>
  );
}
