import Head from 'next/head';
import { t } from '@/lib/i18n';

export default function Contact({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('contact.title', currentLang)} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container">
          <h1>{t('contact.title', currentLang)}</h1>
          <p className="mt-4">{t('contact.intro', currentLang)}</p>

          <div className="grid grid-2 gap-12 mt-12">
            <div>
              <h2>{t('contact.form_title', currentLang)}</h2>
              <form className="mt-8">
                <div className="form-group">
                  <label className="form-label">{t('form.name', currentLang)}</label>
                  <input type="text" placeholder={t('form.name', currentLang)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('form.email', currentLang)}</label>
                  <input type="email" placeholder={t('form.email', currentLang)} required />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('form.message', currentLang)}</label>
                  <textarea placeholder={t('form.message', currentLang)} required></textarea>
                </div>

                <button className="btn btn-primary" type="submit">
                  {t('contact.send', currentLang)}
                </button>
              </form>
            </div>

            <div>
              <h2>{t('footer.contact', currentLang)}</h2>
              <p className="mt-4">
                <strong>{currentLang === 'fa' ? 'ایمیل' : 'E-Mail'}:</strong>
                <br />
                <a href="mailto:contact@didar-stuttgart.de">contact@didar-stuttgart.de</a>
              </p>

              <h3 className="mt-8">{t('footer.follow_us', currentLang)}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li className="mt-2">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    📷 Instagram
                  </a>
                </li>
                <li className="mt-2">
                  <a href="https://t.me" target="_blank" rel="noopener noreferrer">
                    ✈️ Telegram
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
