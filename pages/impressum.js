import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function Impressum({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('legal.impressum', currentLang)} - {currentLang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Link href="/" className="btn btn-tertiary mb-8">
            {currentLang === 'fa' ? '→' : '←'} {t('common.back', currentLang)}
          </Link>

          <h1>{t('legal.impressum', currentLang)}</h1>

          {currentLang === 'fa' ? (
            <div className="mt-8">
              <h2 className="mt-12">ارائه‌دهنده و نشانی</h2>
              <p className="mt-4">
                <strong>Didar – Hochschulgruppe an der Universität Stuttgart</strong><br />
                Pfaffenwaldring 5c<br />
                70569 Stuttgart, Deutschland
              </p>

              <h2 className="mt-12">مسئولان</h2>
              <p className="mt-4">
                Danial Haghgoo – بنیان‌گذار<br />
                Sayedali Yarahmadian – هم‌بنیان‌گذار
              </p>

              <h2 className="mt-12">تماس</h2>
              <p className="mt-4">
                <strong>ایمیل:</strong> <a href="mailto:info@didar-stuttgart.com" dir="ltr">info@didar-stuttgart.com</a><br />
                <strong>تلفن:</strong> <a href="tel:+4915511250722" dir="ltr">+4915511250722</a>
              </p>

              <h2 className="mt-12">وضعیت حقوقی</h2>
              <p className="mt-4">
                دیدار یک گروه دانشجویی (Hochschulgruppe) در دانشگاه اشتوتگارت است. این وب‌سایت توسط دانشجویان دانشگاه اشتوتگارت برای مقاصد فرهنگی و اجتماعی ایجاد شده است.
              </p>

              <h2 className="mt-12">مسئولیت محتوا</h2>
              <p className="mt-4">
                ما به‌عنوان ارائه‌دهنده، طبق قوانین عمومی مسئول محتوای خودِ این وب‌سایت هستیم.
              </p>

              <h2 className="mt-12">پیوندهای خارجی</h2>
              <p className="mt-4">
                این وب‌سایت به سایت‌های خارجی پیوند دارد. بر محتوای آن‌ها نفوذی نداریم؛ مسئولیت هر سایت پیوندشده با خود گرداننده آن است.
              </p>

              <h2 className="mt-12">حق نشر</h2>
              <p className="mt-4">
                تا جایی که محتوای این وب‌سایت مشمول حق نشر است، تکثیر یا استفادهٔ دوباره از آن فقط با رضایت دارندگان حق مجاز است.
              </p>

              <h2 className="mt-12">حریم خصوصی</h2>
              <p className="mt-4">
                اطلاعات مربوط به پردازش داده‌های شخصی را در <Link href="/datenschutz">سیاست حریم خصوصی</Link> بخوانید.
              </p>

              <p className="mt-8" style={{ color: 'var(--color-text-muted)' }}>
                <em>آخرین به‌روزرسانی: سپتامبر ۲۰۲۶</em>
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="mt-12">Anbieter und Anschrift</h2>
              <p className="mt-4">
                <strong>Didar – Hochschulgruppe an der Universität Stuttgart</strong><br />
                Pfaffenwaldring 5c<br />
                70569 Stuttgart, Deutschland
              </p>

              <h2 className="mt-12">Verantwortlich</h2>
              <p className="mt-4">
                Danial Haghgoo – Gründer<br />
                Sayedali Yarahmadian – Mitgründer
              </p>

              <h2 className="mt-12">Kontakt</h2>
              <p className="mt-4">
                <strong>E-Mail:</strong> <a href="mailto:info@didar-stuttgart.com">info@didar-stuttgart.com</a><br />
                <strong>Telefon:</strong> <a href="tel:+4915511250722">+4915511250722</a>
              </p>

              <h2 className="mt-12">Rechtlicher Status</h2>
              <p className="mt-4">
                Didar ist eine Hochschulgruppe an der Universität Stuttgart. Diese Website wurde von Studierenden der Universität Stuttgart für kulturelle und soziale Zwecke erstellt.
              </p>

              <h2 className="mt-12">Haftung für Inhalte</h2>
              <p className="mt-4">
                Für die eigenen Inhalte dieser Website sind wir nach den allgemeinen Gesetzen verantwortlich.
              </p>

              <h2 className="mt-12">Haftung für Links</h2>
              <p className="mt-4">
                Diese Website enthält Links zu externen Websites. Auf deren Inhalte haben wir keinen Einfluss; verantwortlich ist jeweils der Betreiber der verlinkten Seite.
              </p>

              <h2 className="mt-12">Urheberrecht</h2>
              <p className="mt-4">
                Soweit die Inhalte dieser Website urheberrechtlich geschützt sind, dürfen sie nur mit Zustimmung der jeweiligen Rechteinhaber vervielfältigt oder weiterverwendet werden.
              </p>

              <h2 className="mt-12">Datenschutz</h2>
              <p className="mt-4">
                Informationen zur Verarbeitung personenbezogener Daten finden Sie in unserer <Link href="/datenschutz">Datenschutzerklärung</Link>.
              </p>

              <p className="mt-8" style={{ color: 'var(--color-text-muted)' }}>
                <em>Zuletzt aktualisiert: September 2026</em>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
