import Head from 'next/head';
import Link from 'next/link';
import { t, formatDate, formatTime } from '@/lib/i18n';
import mockEvents from '@/data/mockEvents.json';

export default function EventDetail({ event, currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  if (!event) {
    return <div className="container py-8"><h1>{t('common.error', currentLang)}</h1></div>;
  }

  const title = event[`title_${currentLang}`] || event.title_de;
  const description = event[`description_${currentLang}`] || event.description_de;
  const location = event[`location_${currentLang}`] || event.location_de;

  return (
    <>
      <Head>
        <title>{title} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <Link href="/veranstaltungen" className="btn btn-tertiary mb-8">
            ← {t('event.back_to_events', currentLang)}
          </Link>

          <div
            style={{
              width: '100%',
              height: '400px',
              backgroundImage: `url('${event.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-8)',
            }}
            role="img"
            aria-label={title}
          />

          <h1>{title}</h1>

          <div className="grid grid-2 mt-8 gap-8">
            <div>
              <h3>{t('event.date', currentLang)}</h3>
              <p>{formatDate(event.date, currentLang)}</p>

              <h3 className="mt-6">{t('event.time', currentLang)}</h3>
              <p>{formatTime(event.time, currentLang)}</p>

              {location && (
                <>
                  <h3 className="mt-6">{t('event.location', currentLang)}</h3>
                  <p>{location}</p>
                </>
              )}
            </div>

            <div>
              <h3>{t('event.description', currentLang)}</h3>
              <p>{description}</p>

              <div className="mt-8">
                <div className="form-success">
                  <p style={{ marginBottom: 0 }}>
                    {t('form.success', currentLang)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export async function getStaticProps({ params }) {
  const event = mockEvents.find((e) => e.slug === params.slug);
  return {
    props: { event: event || null },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const paths = mockEvents.map((event) => ({
    params: { slug: event.slug },
  }));
  return { paths, fallback: false };
}
