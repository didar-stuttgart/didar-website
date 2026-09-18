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
            {currentLang === 'fa' ? '→' : '←'} {t('common.back', currentLang)}
          </Link>

          <h1>{t('legal.datenschutz', currentLang)}</h1>

          {currentLang === 'fa' ? (
            <div className="mt-8">
              <p className="mt-6">
                <strong>آخرین به‌روزرسانی:</strong> سپتامبر ۲۰۲۶
              </p>

              <h2 className="mt-12">۱. معرفی</h2>
              <p className="mt-4">
                DIDAR – Hochschulgruppe an der Universität Stuttgart (به اختصار &quot;ما&quot; یا &quot;دیدار&quot;) متعهد به حفاظت از حریم خصوصی و امنیت اطلاعات شخصی شما است. این سند توضیح می‌دهد که ما چگونه اطلاعات شما را جمع‌آوری، استفاده و حفاظت می‌کنیم.
              </p>

              <h2 className="mt-12">۲. اطلاعات جمع‌آوری شده</h2>
              <p className="mt-4">
                ما اطلاعات زیر را تنها زمانی جمع‌آوری می‌کنیم که شما خود آن را ارائه دهید:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>ثبت‌نام رویداد:</strong> نام، نام خانوادگی، آدرس ایمیل، شماره تماس (اختیاری)، شناسه تلگرام (اختیاری)</li>
                <li><strong>درخواست عضویت:</strong> نام، نام خانوادگی، آدرس ایمیل، شماره تماس (اختیاری), اطلاعات اضافی (اختیاری)</li>
                <li><strong>فرم تماس:</strong> نام، آدرس ایمیل، پیام</li>
              </ul>

              <h2 className="mt-12">۳. مبنای حقوقی پردازش</h2>
              <p className="mt-4">
                پردازش اطلاعات شما بر اساس:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>اجرای قرارداد:</strong> برای پردازش ثبت‌نام رویداد و درخواست عضویت شما</li>
                <li><strong>منافع قانونی:</strong> برای پاسخ‌دهی به پیام‌های تماس و بهتر کردن خدمات ما</li>
                <li><strong>رضایت صریح:</strong> هنگامی که شما صراحتاً موافقت می‌کنید</li>
              </ul>

              <h2 className="mt-12">۴. استفاده از اطلاعات</h2>
              <p className="mt-4">
                اطلاعات شما فقط برای مقاصد زیر استفاده می‌شود:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>پردازش و تأیید ثبت‌نام رویدادها</li>
                <li>ارسال اطلاعات مرتبط با رویدادها (تاریخ، مکان، تغییرات)</li>
                <li>پردازش و بررسی درخواست‌های عضویت</li>
                <li>ارسال پاسخ به پیام‌های تماس</li>
                <li>بهتر کردن تجربه کاربری سایت</li>
              </ul>

              <h2 className="mt-12">۵. اشتراک‌گذاری اطلاعات</h2>
              <p className="mt-4">
                ما اطلاعات شخصی شما را با اشخاص ثالث به‌اشتراک نمی‌گذاریم، مگر در موارد زیر:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>اگر قانون یا مقررات آن را مستلزم کند</li>
                <li>برای حفاظت از حقوق، امنیت یا ایمنی ما یا دیگران</li>
              </ul>

              <h2 className="mt-12">۶. مدت نگهداری اطلاعات</h2>
              <p className="mt-4">
                اطلاعات شما برای مدت‌های زیر نگهداری می‌شود:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>ثبت‌نام رویداد:</strong> ۳ ماه پس از پایان رویداد</li>
                <li><strong>درخواست عضویت (تأیید‌شده):</strong> ۶ ماه پس از تصمیم نهایی</li>
                <li><strong>درخواست عضویت (رد‌شده/پس‌گرفته‌شده):</strong> ۳ ماه پس از تصمیم یا پس‌گیری</li>
                <li><strong>پیام‌های تماس:</strong> ۶ ماه پس از بسته شدن موضوع</li>
              </ul>

              <h2 className="mt-12">۷. حقوق شما</h2>
              <p className="mt-4">
                شما حقوق زیر را دارید:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>دسترسی:</strong> درخواست کپی اطلاعات شخصی ما درباره شما</li>
                <li><strong>تصحیح:</strong> درخواست تصحیح اطلاعات نادرست</li>
                <li><strong>حذف:</strong> درخواست حذف اطلاعات شما (با محدودیت‌های قانونی)</li>
                <li><strong>محدود کردن پردازش:</strong> درخواست محدود کردن نحوه استفاده ما از اطلاعاتتان</li>
                <li><strong>اعتراض:</strong> اعتراض به پردازش اطلاعات شما</li>
                <li><strong>حمل‌پذیری:</strong> درخواست اطلاعاتتان در قالب قابل‌استفاده</li>
              </ul>

              <h2 className="mt-12">۸. امنیت اطلاعات</h2>
              <p className="mt-4">
                ما تدابیر فنی و سازمانی مناسب را برای حفاظت از اطلاعات شما علیه دسترسی غیرمجاز، تغییر، افشا یا حذف اعمال می‌کنیم. این تدابیر شامل رمزگذاری، محدودیت دسترسی، و پایش منظم است.
              </p>

              <h2 className="mt-12">۹. تماس با ما</h2>
              <p className="mt-4">
                اگر سوالات یا نگرانی‌های خصوصی دارید، یا برای استفاده از حقوق فوق‌الذکر، لطفاً با ما تماس بگیرید:
              </p>
              <p className="mt-4">
                <strong>DIDAR – Hochschulgruppe an der Universität Stuttgart</strong><br />
                Pfaffenwaldring 5c<br />
                70569 Stuttgart, Deutschland<br />
                Email: info@didar-stuttgart.com<br />
                Phone: +49 155 11250722
              </p>

              <h2 className="mt-12">۱۰. شکایت نسبت به تصمیمات خصوصی</h2>
              <p className="mt-4">
                شما حق دارید شکایت را به مقامات حفاظت از داده‌ها در بادن-وورتمبرگ مطرح کنید. برای اطلاعات بیشتر، لطفاً <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">وب‌سایت مقام مرکزی حفاظت از داده‌های فدرال آلمان</a> را ببینید.
              </p>

              <h2 className="mt-12">۱۱. تغییرات این سیاست</h2>
              <p className="mt-4">
                ما ممکن است این سیاست را هر زمان به‌روز کنیم. تغییرات را از طریق سایت ما اطلاع خواهیم داد.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <p className="mt-6">
                <strong>Zuletzt aktualisiert:</strong> September 2026
              </p>

              <h2 className="mt-12">1. Einleitung</h2>
              <p className="mt-4">
                DIDAR – Hochschulgruppe an der Universität Stuttgart (im Folgenden &quot;wir&quot; oder &quot;DIDAR&quot;) verpflichtet sich zum Schutz Ihrer Privatsphäre und zur Sicherheit Ihrer persönlichen Daten. Dieses Dokument erklärt, wie wir Ihre Daten erfassen, verwenden und schützen.
              </p>

              <h2 className="mt-12">2. Erfasste Informationen</h2>
              <p className="mt-4">
                Wir erfassen Informationen nur, wenn Sie diese freiwillig bereitstellen:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>Veranstaltungsanmeldung:</strong> Vorname, Nachname, E-Mail-Adresse, Telefonnummer (optional), Telegram-ID (optional)</li>
                <li><strong>Mitgliedschaftsantrag:</strong> Vorname, Nachname, E-Mail-Adresse, Telefonnummer (optional), Zusätzliche Informationen (optional)</li>
                <li><strong>Kontaktformular:</strong> Name, E-Mail-Adresse, Nachricht</li>
              </ul>

              <h2 className="mt-12">3. Rechtsgrundlage für die Verarbeitung</h2>
              <p className="mt-4">
                Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>Vertragserfüllung:</strong> Um Ihre Veranstaltungsanmeldung und Ihren Mitgliedschaftsantrag zu bearbeiten</li>
                <li><strong>Berechtigte Interessen:</strong> Um auf Ihre Kontaktnachrichten zu antworten und unsere Dienste zu verbessern</li>
                <li><strong>Ausdrückliche Zustimmung:</strong> Wenn Sie diese ausdrücklich erteilen</li>
              </ul>

              <h2 className="mt-12">4. Verwendung der Informationen</h2>
              <p className="mt-4">
                Ihre Informationen werden nur für folgende Zwecke verwendet:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>Bearbeitung und Bestätigung von Veranstaltungsanmeldungen</li>
                <li>Versand von veranstaltungsbezogenen Informationen (Datum, Ort, Änderungen)</li>
                <li>Bearbeitung und Bewertung von Mitgliedschaftsanträgen</li>
                <li>Beantwortung von Kontaktnachrichten</li>
                <li>Verbesserung der Benutzererfahrung auf unserer Website</li>
              </ul>

              <h2 className="mt-12">5. Weitergabe von Informationen</h2>
              <p className="mt-4">
                Wir geben Ihre persönlichen Daten nicht an Dritte weiter, außer in folgenden Fällen:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>Wenn Gesetze oder Bestimmungen dies verlangen</li>
                <li>Zum Schutz unserer oder anderer Rechte, Sicherheit oder Sicherheit</li>
              </ul>

              <h2 className="mt-12">6. Aufbewahrungsdauer der Daten</h2>
              <p className="mt-4">
                Ihre Daten werden wie folgt aufbewahrt:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>Veranstaltungsanmeldung:</strong> 3 Monate nach Ende der Veranstaltung</li>
                <li><strong>Mitgliedschaftsantrag (akzeptiert):</strong> 6 Monate nach endgültiger Entscheidung</li>
                <li><strong>Mitgliedschaftsantrag (abgelehnt/zurückgezogen):</strong> 3 Monate nach Entscheidung oder Rückzug</li>
                <li><strong>Kontaktnachrichten:</strong> 6 Monate nach Abschluss des Anliegens</li>
              </ul>

              <h2 className="mt-12">7. Ihre Rechte</h2>
              <p className="mt-4">
                Sie haben folgende Rechte:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li><strong>Auskunft:</strong> Kopie Ihrer personenbezogenen Daten anfordern</li>
                <li><strong>Berichtigung:</strong> Unrichtige Daten korrigieren lassen</li>
                <li><strong>Löschung:</strong> Ihre Daten löschen lassen (unter rechtlichen Einschränkungen)</li>
                <li><strong>Einschränkung:</strong> Die Verarbeitung Ihrer Daten einschränken lassen</li>
                <li><strong>Widerspruch:</strong> Der Verarbeitung Ihrer Daten widersprechen</li>
                <li><strong>Datenportabilität:</strong> Ihre Daten in lesbarer Form anfordern</li>
              </ul>

              <h2 className="mt-12">8. Datensicherheit</h2>
              <p className="mt-4">
                Wir setzen angemessene technische und organisatorische Maßnahmen ein, um Ihre Daten vor unbefugtem Zugriff, Änderung, Offenlegung oder Löschung zu schützen. Diese Maßnahmen umfassen Verschlüsselung, Zugriffsbeschränkung und regelmäßige Überwachung.
              </p>

              <h2 className="mt-12">9. Kontaktieren Sie uns</h2>
              <p className="mt-4">
                Bei Fragen oder Bedenken zum Datenschutz oder um Ihre Rechte wahrzunehmen, kontaktieren Sie uns bitte:
              </p>
              <p className="mt-4">
                <strong>DIDAR – Hochschulgruppe an der Universität Stuttgart</strong><br />
                Pfaffenwaldring 5c<br />
                70569 Stuttgart, Deutschland<br />
                Email: info@didar-stuttgart.com<br />
                Phone: +49 155 11250722
              </p>

              <h2 className="mt-12">10. Beschwerde bei einer Datenschutzbehörde</h2>
              <p className="mt-4">
                Sie haben das Recht, eine Beschwerde bei der Datenschutzbehörde in Baden-Württemberg einzureichen. Weitere Informationen finden Sie auf der <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer">Website der Bundesbeauftragten für den Datenschutz und die Informationsfreiheit</a>.
              </p>

              <h2 className="mt-12">11. Änderungen dieser Richtlinie</h2>
              <p className="mt-4">
                Wir können diese Richtlinie jederzeit aktualisieren. Änderungen werden auf unserer Website bekannt gegeben.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
