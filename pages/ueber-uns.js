import Head from 'next/head';
import { t } from '@/lib/i18n';

export default function About({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('about.title', currentLang)} - {currentLang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('about.intro', currentLang)}</h1>

          <h2 className="mt-12">{t('about.mission', currentLang)}</h2>
          <p className="mt-8" style={{ fontSize: 'var(--fs-lg)' }}>
            {t('about.mission_text', currentLang)}
          </p>

          <div className="split-grid mt-16">
            <div className="split-image">
              <img
                src="/images/about-community.jpg"
                alt=""
                loading="lazy"
                style={{
                  width: '100%',
                  height: '360px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-lg)',
                }}
              />
            </div>
            <div className="split-content">
              <h3>{currentLang === 'fa' ? 'درباره دیدار' : 'Über Didar'}</h3>
              <p className="mt-4">
                {currentLang === 'fa'
                  ? 'دیدار یک جامعه فرهنگی و هنری است که به ارتقای تبادل فرهنگی ایرانی در شتوتگارت اختصاص دارد. از طریق رویدادهای فرهنگی، نمایشگاه ها، سخنرانی ها و برنامه های تعاملی، دیدار به ارتباط، درک و تحسین میان فرهنگ ها کمک می کند.'
                  : 'Didar ist eine kulturelle und künstlerische Gemeinschaft, die sich dem Austausch iranischer Kultur in Stuttgart widmet. Durch kulturelle Veranstaltungen, Ausstellungen, Vorträge und interaktive Programme fördert Didar den Dialog, das Verständnis und die Wertschätzung zwischen Kulturen.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
