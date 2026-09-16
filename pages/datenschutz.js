import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function Datenschutz({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('legal.datenschutz', currentLang)} - DIDAR</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Link href="/" className="btn btn-tertiary mb-8">
            ← {t('common.back', currentLang)}
          </Link>

          <h1>{t('legal.datenschutz', currentLang)}</h1>

          <div className="mt-12" style={{ backgroundColor: 'var(--color-off-white)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {currentLang === 'fa'
                ? '🔒 سیاست حریم خصوصی برای سایت دیدار به زودی نوشته خواهد شد. ما متعهد به حفاظت از اطلاعات شخصی شما هستیم.'
                : '🔒 Die Datenschutzerklärung für die DIDAR-Website wird bald verfasst. Wir verpflichten uns, Ihre persönlichen Daten zu schützen.'}
            </p>
          </div>

          <h2 className="mt-12">{currentLang === 'fa' ? 'اطلاعات جمع‌آوری شده' : 'Erfasste Informationen'}</h2>
          <p className="mt-4">
            {currentLang === 'fa'
              ? 'وقتی در رویدادها ثبت نام می‌کنید، درخواست عضویت می‌کنید یا با ما تماس می‌گیرید، اطلاعات محدودی جمع‌آوری می‌کنیم: نام، ایمیل، شماره تماس، و شناسه تلگرام (اختیاری).'
              : 'Wenn Sie sich für Veranstaltungen registrieren, einen Mitgliedschaftsantrag stellen oder uns kontaktieren, erfassen wir begrenzte Informationen: Name, E-Mail, Telefonnummer und Telegram-ID (optional).'}
          </p>

          <h2 className="mt-8">{currentLang === 'fa' ? 'استفاده از اطلاعات' : 'Verwendung der Informationen'}</h2>
          <p className="mt-4">
            {currentLang === 'fa'
              ? 'اطلاعات شما فقط برای پردازش درخواست شما، ارتباط راجع به رویدادهای دیدار، و بهتر کردن خدمات ما استفاده می‌شود.'
              : 'Ihre Informationen werden nur zur Verarbeitung Ihrer Anfrage, zur Kommunikation über DIDAR-Veranstaltungen und zur Verbesserung unserer Dienste verwendet.'}
          </p>
        </div>
      </section>
    </>
  );
}
