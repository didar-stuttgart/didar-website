/**
 * Homepage
 * Path: /
 *
 * Phase 9: Rebuilt hero hierarchy, added Cultural Areas and Community sections,
 * reordered content per updated homepage structure requirements.
 */

import Head from 'next/head';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import { t } from '@/lib/i18n';
import { createServerClient } from '@/lib/supabase';

export async function getStaticProps() {
  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Fetch upcoming events directly from Supabase
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('event_date', today)
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events from Supabase:', error);
      return {
        props: {
          featuredEvents: [],
        },
        revalidate: 300,
      };
    }

    // Show up to 3 upcoming events on the homepage
    const featuredEvents = (events || []).slice(0, 3);

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
        <title>{t('home.page_title', currentLang)}</title>
        <meta name="description" content={t('home.subtitle', currentLang)} />
        <meta property="og:title" content={t('home.page_title', currentLang)} />
        <meta property="og:description" content={t('home.subtitle', currentLang)} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/images/hero-banner.jpg" />
      </Head>

      {/* HERO SECTION — image on the left/background, copy anchored into the
          image's own empty right-hand wall on desktop; a separate, simpler
          stacked composition (image, then copy) on mobile. */}
      <section className="hero-section" dir={dir}>
        <div className="hero-media">
          <img
            src="/images/hero-banner.jpg"
            alt=""
            className="hero-media-img"
          />
        </div>
        <div className="hero-copy">
          <h1 className="hero-title">
            {currentLang === 'fa' ? 'دیدار' : 'Didar Stuttgart'}
          </h1>
          {currentLang === 'fa' && (
            <p className="hero-subtitle">انجمن فرهنگی هنری اشتوتگارت</p>
          )}
          <div className="hero-cta">
            <Link href="/veranstaltungen" className="btn btn-primary">
              {t('home.cta_primary', currentLang)}
            </Link>
            <Link href="/ueber-uns" className="btn btn-secondary">
              {t('home.cta_secondary', currentLang)}
            </Link>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="section" dir={dir}>
        <div className="container">
          <h2>{t('home.upcoming_events', currentLang)}</h2>
          {featuredEvents.length > 0 ? (
            <>
              <div className="grid grid-3 mt-8">
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

      {/* ABOUT + MEMBERSHIP — two balanced content blocks, side by side on
          desktop, stacked on mobile. Replaces the previous three separate
          sections (About, Cultural Areas, Membership) and the standalone
          Community/Social section per the homepage simplification pass. */}
      <section
        className="section about-membership-section"
        dir={dir}
        style={{ backgroundColor: 'var(--color-off-white)' }}
      >
        <div className="container">
          <div className="grid grid-2 about-membership-grid">
            <div className="info-card">
              <img
                src="/images/about-heritage.jpg"
                alt=""
                loading="lazy"
                className="info-card-image"
              />
              <div className="info-card-body">
                <h2>{t('home.about_section', currentLang)}</h2>
                <p>{t('home.about_text', currentLang)}</p>
                <Link href="/ueber-uns" className="btn btn-tertiary">
                  {t('common.learn_more', currentLang)}
                </Link>
              </div>
            </div>

            <div className="info-card">
              <img
                src="/images/membership-community.jpg"
                alt=""
                loading="lazy"
                className="info-card-image"
              />
              <div className="info-card-body">
                <h2>{t('home.membership_section', currentLang)}</h2>
                <p>{t('home.membership_text', currentLang)}</p>
                <Link href="/mitglied-werden" className="btn btn-primary">
                  {t('home.membership_cta', currentLang)}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
