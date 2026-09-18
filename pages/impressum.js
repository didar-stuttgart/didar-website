import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

export default function Impressum({ currentLang }) {
  const dir = currentLang === 'fa' ? 'rtl' : 'ltr';

  return (
    <>
      <Head>
        <title>{t('legal.impressum', currentLang)} - {currentLang === 'fa' ? 'دیدار' : 'DIDAR'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Link href="/" className="btn btn-tertiary mb-8">
            {currentLang === 'fa' ? '→' : '←'} {t('common.back', currentLang)}
          </Link>

          <h1>{t('legal.impressum', currentLang)}</h1>

          {currentLang === 'fa' ? (
            <div className="mt-8">
              <h2 className="mt-12">مسئولان و تماس</h2>
              <p className="mt-4">
                <strong>DIDAR – Hochschulgruppe an der Universität Stuttgart</strong><br />
                Pfaffenwaldring 5c<br />
                70569 Stuttgart, Deutschland
              </p>

              <p className="mt-4">
                <strong>ایمیل:</strong> <a href="mailto:info@didar-stuttgart.com" dir="ltr">info@didar-stuttgart.com</a><br />
                <strong>تلفن:</strong> +49 155 11250722
              </p>

              <h2 className="mt-12">مسئولان</h2>
              <p className="mt-4">
                دیدار توسط اعضای زیر مدیریت می‌شود:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>Danial Haghgoo</li>
                <li>Sayedali Yarahmadian</li>
              </ul>

              <h2 className="mt-12">توضیحات حقوقی</h2>
              <p className="mt-4">
                این سایت توسط دانشجویان دانشگاه شتوتگارت برای مقاصد فرهنگی و اجتماعی ایجاد شده است. دیدار یک گروه دانشجویی رسمی است که در دانشگاه ثبت‌نام شده است، نه یک انجمن یا سازمان قانونی جداگانه.
              </p>

              <h2 className="mt-12">مسئولیت محتوا</h2>
              <p className="mt-4">
                ما برای دقت، کامل بودن و به‌روز بودن محتوای سایت تلاش می‌کنیم. با این حال، ما مسئول نیستیم برای:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>خطاها یا عدم دقت در محتوا</li>
                <li>آسیب مستقیم یا غیرمستقیم ناشی از استفاده از سایت</li>
                <li>محتوای لینک‌های خارجی</li>
              </ul>

              <h2 className="mt-12">پیوند خارجی</h2>
              <p className="mt-4">
                این سایت ممکن است حاوی پیوند‌های خارجی باشد. ما مسئول محتوا، دقت یا سیاست‌های حریم خصوصی سایت‌های خارجی نیستیم.
              </p>

              <h2 className="mt-12">مالکیت معنوی</h2>
              <p className="mt-4">
                تمام محتوا، طرح‌بندی و عناصر بصری این سایت (تصاویر، متن، لوگو) متعلق به دیدار یا دارندگان مجوز آن است. تکثیر یا استفاده بدون اجازه نوشتاری ممنوع است.
              </p>

              <h2 className="mt-12">سیاست حریم خصوصی</h2>
              <p className="mt-4">
                برای اطلاعات در مورد نحوه مدیریت داده‌های شخصی شما، لطفاً <Link href="/datenschutz">سیاست حریم خصوصی ما</Link> را بخوانید.
              </p>

              <h2 className="mt-12">تغییرات در این اطلاعات</h2>
              <p className="mt-4">
                ما حق داریم این اطلاعات را بدون اطلاع قبلی به‌روز کنیم. تغییرات را از طریق سایت اطلاع خواهیم داد.
              </p>

              <p className="mt-8" style={{ color: 'var(--color-text-muted)' }}>
                <em>آخرین به‌روزرسانی: سپتامبر ۲۰۲۶</em>
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="mt-12">Verantwortliche Ansprechpartner</h2>
              <p className="mt-4">
                <strong>DIDAR – Hochschulgruppe an der Universität Stuttgart</strong><br />
                Pfaffenwaldring 5c<br />
                70569 Stuttgart, Deutschland
              </p>

              <p className="mt-4">
                <strong>E-Mail:</strong> <a href="mailto:info@didar-stuttgart.com">info@didar-stuttgart.com</a><br />
                <strong>Telefon:</strong> +49 155 11250722
              </p>

              <h2 className="mt-12">Sprecherinnen und Sprecher</h2>
              <p className="mt-4">
                DIDAR wird von folgenden Ansprechpartnerinnen und Ansprechpartnern verwaltet:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>Danial Haghgoo</li>
                <li>Sayedali Yarahmadian</li>
              </ul>

              <h2 className="mt-12">Rechtlicher Hinweis</h2>
              <p className="mt-4">
                Diese Website wurde von Studierenden der Universität Stuttgart für kulturelle und soziale Zwecke erstellt. DIDAR ist eine offizielle Hochschulgruppe der Universität Stuttgart und keine separate juristische Person oder verein (eingetragener Verein, e.V.).
              </p>

              <h2 className="mt-12">Haftung für Inhalte</h2>
              <p className="mt-4">
                Wir bemühen uns, die Genauigkeit, Vollständigkeit und Aktualität der Inhalte dieser Website sicherzustellen. Wir haften jedoch nicht für:
              </p>
              <ul style={{ marginTop: 'var(--space-4)', marginLeft: 'var(--space-6)', listStyle: 'disc' }}>
                <li>Fehler oder Ungenauigkeiten in den Inhalten</li>
                <li>Direkte oder indirekte Schäden durch die Nutzung dieser Website</li>
                <li>Inhalte externer verknüpfter Websites</li>
              </ul>

              <h2 className="mt-12">Externe Links</h2>
              <p className="mt-4">
                Diese Website kann externe Links enthalten. Wir sind nicht verantwortlich für den Inhalt, die Genauigkeit oder die Datenschutzrichtlinien externer Websites.
              </p>

              <h2 className="mt-12">Geistiges Eigentum</h2>
              <p className="mt-4">
                Alle Inhalte, Designs und visuellen Elemente dieser Website (Bilder, Texte, Logos) sind Eigentum von DIDAR oder seiner Lizenzgeber. Eine Vervielfältigung oder Verwendung ohne schriftliche Genehmigung ist untersagt.
              </p>

              <h2 className="mt-12">Datenschutz</h2>
              <p className="mt-4">
                Für Informationen darüber, wie wir Ihre personenbezogenen Daten verwalten, lesen Sie bitte unsere <Link href="/datenschutz">Datenschutzerklärung</Link>.
              </p>

              <h2 className="mt-12">Änderungen dieser Informationen</h2>
              <p className="mt-4">
                Wir behalten uns das Recht vor, diese Informationen jederzeit ohne vorherige Ankündigung zu aktualisieren. Änderungen werden auf dieser Website bekannt gegeben.
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
