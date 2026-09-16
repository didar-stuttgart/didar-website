import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function Impressum({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('legal.impressum', currentLang)} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Link href="/" className="btn btn-tertiary mb-8">
            ← {t('common.back', currentLang)}
          </Link>

          <h1>{t('legal.impressum', currentLang)}</h1>

          <div className="mt-12" style={{ backgroundColor: 'var(--color-off-white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {currentLang === 'fa'
                ? '📝 اطلاعات شامل برای سایت دیدار به زودی به روز خواهد شد. لطفاً به ما برای جزئیات اضافی تماس بگیرید.'
                : '📝 Das Impressum für die DIDAR-Website wird in Kürze aktualisiert. Bitte kontaktieren Sie uns für weitere Informationen.'}
            </p>
          </div>

          <h2 className="mt-12">{currentLang === 'fa' ? 'معلومات تماس' : 'Kontaktinformationen'}</h2>
          <p className="mt-4">
            <strong>Email:</strong> <a href="mailto:contact@didar-stuttgart.de">contact@didar-stuttgart.de</a>
          </p>
        </div>
      </section>
    </>
  );
}
