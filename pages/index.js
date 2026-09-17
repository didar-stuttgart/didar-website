/**
 * Homepage
 * Path: /
 * 
 * Modified for Phase 3C: Integrated hero banner image and sectional layouts
 * Shows hero with background image, featured events, about section, membership CTA
 */

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import EventCard from '@/components/EventCard';
import { t } from '@/lib/i18n';

export async function getStaticProps() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Fetch upcoming events for featured display
    const upcomingRes = await fetch(`${baseUrl}/api/events?status=upcoming`);
    const upcomingData = upcomingRes.ok ? await upcomingRes.json() : { events: [] };

    // Take only first 2 events for homepage teaser
    const featuredEvents = (upcomingData.events || []).slice(0, 2);

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

export default function Home({ featuredEvents, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('home.title', currentLang)} - DIDAR</title>
        <meta name="description" content={t('home.subtitle', currentLang)} />
        <meta property="og:title" content={t('home.title', currentLang)} />
        <meta property="og:description" content={t('home.subtitle', currentLang)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/hero-banner.jpg" />
      </Head>

      {/* HERO SECTION WITH BACKGROUND IMAGE */}
      <section 
        className="section section--hero" 
        dir={dir}
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(85,107,47,0.3)), url(/images/hero-banner.jpg)',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed',
          minHeight: '600px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center'
        }}
      >
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

      {/* FEATURED EVENTS SECTION */}
      <section className="section" dir={dir}>
        <div className="container">
          <h2>{t('home.upcoming_events', currentLang)}</h2>
          {featuredEvents.length > 0 ? (
            <>
              <div className="grid grid-2 mt-8">
                {featuredEvents.map((event) => (
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

      {/* ABOUT SECTION WITH IMAGE */}
      <section className="section container-split" dir={dir} style={{ backgroundColor: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="split-grid">
            <div className="split-image">
              <img 
                src="/images/about-heritage.jpg" 
                alt={t('home.about_section', currentLang)}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div className="split-content">
              <h2>{t('home.about_section', currentLang)}</h2>
              <p className="mt-8" style={{ fontSize: 'var(--fs-lg)' }}>
                {t('home.about_text', currentLang)}
              </p>
              <Link href="/ueber-uns" className="btn btn-tertiary mt-8">
                {t('common.learn_more', currentLang)}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP SECTION WITH IMAGE */}
      <section className="section container-split" dir={dir}>
        <div className="container">
          <div className="split-grid split-reverse">
            <div className="split-image">
              <img 
                src="/images/membership-community.jpg" 
                alt={t('home.membership_section', currentLang)}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div className="split-content">
              <h2>{t('home.membership_section', currentLang)}</h2>
              <p className="mt-8" style={{ fontSize: 'var(--fs-lg)' }}>
                {t('home.membership_text', currentLang)}
              </p>
              <Link href="/mitglied-werden" className="btn btn-primary mt-8">
                {t('home.membership_cta', currentLang)}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
