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
import { SOCIAL_LINKS, InstagramIcon, TelegramIcon } from '@/components/SocialIcons';

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

const CULTURAL_AREAS = [
  { key: 'literature', icon: '📖' },
  { key: 'film', icon: '🎬' },
  { key: 'art', icon: '🎨' },
  { key: 'music', icon: '🎵' },
];

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
            {currentLang === 'fa' ? 'دیدار اشتوتگارت' : 'DIDAR Stuttgart'}
          </h1>
          <p className="hero-tagline">{t('home.hero_tagline', currentLang)}</p>
          <p className="hero-description">{t('home.hero_description', currentLang)}</p>
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

      {/* ABOUT DIDAR */}
      <section
        className="section container-split"
        dir={dir}
        style={{ backgroundColor: 'var(--color-off-white)' }}
      >
        <div className="container">
          <div className="split-grid">
            <div className="split-image">
              <img
                src="/images/about-heritage.jpg"
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
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

      {/* CULTURAL AREAS */}
      <section className="section" dir={dir}>
        <div className="container">
          <img
            src="/images/about-culture.jpg"
            alt=""
            loading="lazy"
            style={{
              width: '100%',
              height: '320px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-8)',
            }}
          />
          <h2>{t('home.cultural_areas_title', currentLang)}</h2>
          <div className="grid grid-4 mt-8">
            {CULTURAL_AREAS.map((area) => (
              <div key={area.key} className="culture-card">
                <span className="culture-icon" aria-hidden="true">
                  {area.icon}
                </span>
                <h3>{t(`culture.${area.key}_title`, currentLang)}</h3>
                <p>{t(`culture.${area.key}_text`, currentLang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="section container-split" dir={dir} style={{ backgroundColor: 'var(--color-off-white)' }}>
        <div className="container">
          <div className="split-grid split-reverse">
            <div className="split-image">
              <img
                src="/images/membership-community.jpg"
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
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

      {/* COMMUNITY / SOCIAL */}
      <section className="section" dir={dir}>
        <div className="container community-section">
          <h2>{t('home.community_title', currentLang)}</h2>
          <p className="mt-4" style={{ fontSize: 'var(--fs-lg)' }}>
            {t('home.community_text', currentLang)}
          </p>
          <div className="hero-cta mt-8">
            <a
              href={SOCIAL_LINKS.telegram}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <TelegramIcon size={18} /> Telegram
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <InstagramIcon size={18} /> Instagram
            </a>
            <Link href="/kontakt" className="btn btn-tertiary">
              {t('nav.contact_cta', currentLang)}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
