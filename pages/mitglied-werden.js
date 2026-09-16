import Head from 'next/head';
import { t } from '@/lib/i18n';

export default function Membership({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('membership.title', currentLang)} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('membership.title', currentLang)}</h1>

          <div className="mt-12 mb-16" style={{ backgroundColor: 'var(--color-off-white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)' }}>
            <h2>{t('membership.intro', currentLang)}</h2>
            <p className="mt-4">
              {currentLang === 'fa'
                ? 'با پیوستن به دیدار، بخشی از جامعه‌ای فعال و پویا می‌شوید که علاقمند به فرهنگ و هنر ایرانی است. عضویت شما به ما کمک می‌کند تا رویدادها و برنامه‌های فرهنگی بیشتری سازماندهی کنیم.'
                : 'Durch die Mitgliedschaft bei DIDAR werden Sie Teil einer aktiven und dynamischen Gemeinschaft, die sich für iranische Kultur und Kunst interessiert. Ihre Mitgliedschaft hilft uns, mehr kulturelle Veranstaltungen und Programme zu organisieren.'
              }
            </p>
          </div>

          <h2>{t('membership.form_title', currentLang)}</h2>
          <p className="mt-4">{t('membership.form_intro', currentLang)}</p>

          <form className="mt-8" style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label">{t('form.first_name', currentLang)}</label>
              <input type="text" placeholder={t('form.first_name', currentLang)} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.last_name', currentLang)}</label>
              <input type="text" placeholder={t('form.last_name', currentLang)} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.email', currentLang)}</label>
              <input type="email" placeholder={t('form.email', currentLang)} required />
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.phone', currentLang)}</label>
              <input type="tel" placeholder={t('form.phone', currentLang)} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.telegram', currentLang)}</label>
              <input type="text" placeholder={t('form.telegram', currentLang)} />
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.additional_info', currentLang)}</label>
              <textarea placeholder={t('form.additional_info', currentLang)}></textarea>
            </div>

            <div className="form-group">
              <label>
                <input type="checkbox" required style={{ marginRight: 'var(--space-2)' }} />
                {t('form.privacy_notice', currentLang)}
              </label>
            </div>

            <button className="btn btn-primary" type="submit">
              {t('common.submit', currentLang)}
            </button>
          </form>

          <p className="mt-8" style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)' }}>
            {t('membership.response_time', currentLang)}
          </p>
        </div>
      </section>
    </>
  );
}
