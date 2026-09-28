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
import EventCarousel from '@/components/EventCarousel';
import { t } from '@/lib/i18n';
import { createServerClient } from '@/lib/supabase';
import { getCMSContent } from '@/lib/cms-client';
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
      console.error('Error fetching events from Supabase:', error);
      return {
        props: {
          recurringEvents: [],
          upcomingEvents: [],
          pastEvents: [],
          heroTitle_fa: null,
          heroTitle_de: null,
          heroSubtitle_fa: null,
          aboutDesc_fa: null,
          aboutDesc_de: null,
        },
        revalidate: 300,
      };
    }

    // Categorize events
    const { recurring, upcoming, past } = categorizeEvents(events || []);

    // Show up to 6 events per category for homepage carousel
    const recurringEvents = recurring.slice(0, 6);
    const upcomingEvents = upcoming.slice(0, 6);
    const pastEvents = past.slice(0, 6);

    // Fetch CMS content for hero section
    const heroTitle_fa = await getCMSContent(
      'homepage.hero.title',
      'fa',
      'home.page_title'
    );
    const heroTitle_de = await getCMSContent(
      'homepage.hero.title',
      'de',
      'home.page_title'
    );
    const heroSubtitle_fa = await getCMSContent(
      'homepage.hero.subtitle',
      'fa',
      'home.subtitle'
    );

    // Fetch CMS content for about card section
    const aboutDesc_fa = await getCMSContent(
      'homepage.about.description',
      'fa',
      'home.about_text'
    );
    const aboutDesc_de = await getCMSContent(
      'homepage.about.description',
      'de',
      'home.about_text'
    );

    return {
      props: {
        recurringEvents,
        upcomingEvents,
        pastEvents,
        heroTitle_fa,
        heroTitle_de,
        heroSubtitle_fa,
        aboutDesc_fa,
        aboutDesc_de,
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
        heroTitle_fa: null,
        heroTitle_de: null,
        heroSubtitle_fa: null,
        aboutDesc_fa: null,
        aboutDesc_de: null,
      },
      revalidate: 300, // Retry after 5 minutes on error
    };
  }
}

export default function Home({
  recurringEvents,
  upcomingEvents,
  pastEvents,
  currentLang,
  heroTitle_fa,
  heroTitle_de,
  heroSubtitle_fa,
  aboutDesc_fa,
  aboutDesc_de,
}) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  // Helper: check if value is a CMS placeholder and use fallback if so
  const getHeroTitle = () => {
    const cmsValue = currentLang === 'fa' ? heroTitle_fa : heroTitle_de;
    const isPlaceholder = cmsValue && cmsValue.startsWith('[');
    if (!isPlaceholder && cmsValue) {
      return cmsValue;
    }
    // Fallback to original hardcoded value
    return currentLang === 'fa' ? 'دیدار' : 'Didar Stuttgart';
  };

  const getHeroSubtitle = () => {
    if (!heroSubtitle_fa || heroSubtitle_fa.startsWith('[')) {
      // Fallback to original hardcoded value
      return 'انجمن فرهنگی هنری اشتوتگارت';
    }
    return heroSubtitle_fa;
  };

  const getAboutDescription = () => {
    const cmsValue = currentLang === 'fa' ? aboutDesc_fa : aboutDesc_de;
    const isPlaceholder = cmsValue && cmsValue.startsWith('[');
    if (!isPlaceholder && cmsValue) {
      return cmsValue;
    }
    // Fallback to i18n value
    return t('home.about_text', currentLang);
  };

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
            {getHeroTitle()}
          </h1>
          {currentLang === 'fa' && (
            <p className="hero-subtitle">{getHeroSubtitle()}</p>
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

      {/* EVENTS — RECURRING, UPCOMING, PAST */}
      <section className="section events-section" dir={dir}>
        <div className="container">
          {/* Recurring Events */}
          {recurringEvents.length > 0 && (
            <div className="events-category">
              <div className="events-category-header">
                <h2>{t('events.recurring', currentLang)}</h2>
                <Link href="/veranstaltungen" className="btn btn-tertiary">
                  {t('events.all_events', currentLang)}
                </Link>
              </div>
              <EventCarousel currentLang={currentLang}>
                {recurringEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} />
                ))}
              </EventCarousel>
            </div>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div className="events-category">
              <div className="events-category-header">
                <h2>{t('events.upcoming', currentLang)}</h2>
                <Link href="/veranstaltungen" className="btn btn-tertiary">
                  {t('events.all_events', currentLang)}
                </Link>
              </div>
              <EventCarousel currentLang={currentLang}>
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} />
                ))}
              </EventCarousel>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="events-category">
              <div className="events-category-header">
                <h2>{t('events.past', currentLang)}</h2>
                <Link href="/veranstaltungen" className="btn btn-tertiary">
                  {t('events.all_events', currentLang)}
                </Link>
              </div>
              <EventCarousel currentLang={currentLang}>
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} currentLang={currentLang} isPast />
                ))}
              </EventCarousel>
            </div>
          )}

          {/* No events message */}
          {recurringEvents.length === 0 && upcomingEvents.length === 0 && pastEvents.length === 0 && (
            <div className="events-empty">
              <p>{t('events.no_upcoming', currentLang)}</p>
              <Link href="/veranstaltungen" className="btn btn-secondary">
                {t('events.all_events', currentLang)}
              </Link>
            </div>
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
                <p>{getAboutDescription()}</p>
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
