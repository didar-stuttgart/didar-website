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

          <div className="about-image mt-16">
            <img
              src="/images/about-community.jpg"
              alt=""
              loading="lazy"
              style={{
                width: '100%',
                maxHeight: '420px',
                objectFit: 'cover',
                borderRadius: 'var(--radius-lg)',
              }}
            />
          </div>

          <div className="about-story mt-12" style={{ maxWidth: '760px' }}>
            <h3>{currentLang === 'fa' ? 'درباره دیدار' : 'Über Didar'}</h3>

            {currentLang === 'fa' ? (
              <>
                <p className="mt-6">
                  ایده‌ی شکل‌گیری «دیدار» هم‌زمان با اتفاقات ایران و از دل تجربه‌ی ما در دیاسپورا شکل گرفت؛ تجربه‌ی تنهایی، دوری و احساس گسست از آنچه در سرزمین‌مان می‌گذشت. در شهر اشتوتگارت، میان این فاصله و بی‌خبری، این فکر شکل گرفت که شاید بتوان جایی برای دوباره کنار هم بودن ساخت؛ جایی برای گفت‌وگو، شنیدن، تماشا و تجربه‌ی جمعی.
                </p>

                <p className="mt-6">
                  «دیدار» از همین نیاز آغاز شد؛ از این باور که حتی در فاصله از خانه، می‌توان فضایی برای نزدیک‌تر شدن به یکدیگر ساخت. نام «دیدار» نیز از همین معنا می‌آید؛ از لحظه‌ای که آدم‌ها دوباره روبه‌روی هم می‌نشینند، یکدیگر را می‌بینند و آنگاه تجربه ی جدیدی شکل میگیرد.
                </p>

                <h4 className="mt-10">شکل گیری و چشم انداز :</h4>

                <p className="mt-6">
                  «دیدار» در تابستان ۲۰۲۶ در دانشگاه اشتوتگارت به‌صورت رسمی ثبت شد و فعالیت خود را با برنامه‌ریزی برای برگزاری مجموعه‌ای از رویدادها آغاز کرد.
                </p>

                <p className="mt-6">
                  چشم‌انداز ما فعالیت در سه حوزه‌ی <strong>هنر، فرهنگ و سلامت روان</strong> است؛ حوزه‌هایی که می‌توانند بستری برای گفت‌وگو، آفرینش و ارتباط فراهم کنند. می‌خواهیم «دیدار» فضایی باشد برای کسانی که چیزی برای گفتن، ساختن، اجرا کردن یا به اشتراک گذاشتن دارند و در کنار آن، برای کسانی که می‌خواهند ببینند، بشنوند، یاد بگیرند و با دیگران همراه شوند.
                </p>

                <p className="mt-6">
                  برای ما، «دیدار» فقط برگزاری چند برنامه نیست؛ تلاشی‌ست برای ساختن یک فضای جمعی و زنده برای جامعه‌ی فارسی‌زبان در اشتوتگارت؛ جایی برای پیدا کردن یکدیگر، شکل گرفتن ایده‌ها و ساختن ارتباط‌هایی که بتوانند این جامعه را به آینده‌ای روشن‌تر نزدیک کنند.
                </p>
              </>
            ) : (
              <p className="mt-6">
                Didar ist eine kulturelle und künstlerische Gemeinschaft, die sich dem Austausch iranischer Kultur in Stuttgart widmet. Durch kulturelle Veranstaltungen, Ausstellungen, Vorträge und interaktive Programme fördert Didar den Dialog, das Verständnis und die Wertschätzung zwischen Kulturen.
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
