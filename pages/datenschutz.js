import Head from 'next/head';
import Link from 'next/link';
import { t } from '@/lib/i18n';

// Datenschutz / حریم خصوصی
// DE and FA share one structure: 14 sections, same order, same claims.
// Keep both languages semantically identical when editing.

const ulStyle = {
  marginTop: 'var(--space-4)',
  marginInlineStart: 'var(--space-6)',
  listStyle: 'disc',
};

const faDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFaNumber = (n) => String(n).replace(/\d/g, (d) => faDigits[Number(d)]);

const P = ({ children }) => <p className="mt-4">{children}</p>;
const UL = ({ children }) => <ul style={ulStyle}>{children}</ul>;

const LFDI_URL = 'https://www.baden-wuerttemberg.datenschutz.de';

const de = {
  updated: 'Stand: Oktober 2026',
  sections: [
    {
      title: 'Verantwortliche',
      body: (
        <>
          <P>Verantwortliche im Sinne der Datenschutz-Grundverordnung (DSGVO) für die Verarbeitung personenbezogener Daten auf dieser Website sind:</P>
          <UL>
            <li>Danial Haghgoo</li>
            <li>Sayedali Yarahmadian (auf der Website und bei Veranstaltungen auch unter dem öffentlichen Namen „Avid“ bekannt)</li>
          </UL>
          <P>
            Didar – Hochschulgruppe an der Universität Stuttgart<br />
            Pfaffenwaldring 5c, 70569 Stuttgart, Deutschland<br />
            E-Mail: info@didar-stuttgart.com<br />
            Telefon: +49 155 11250722
          </P>
          <P>Zugriff auf den Verwaltungsbereich und die Datenbank haben nur diese beiden Personen. Anmelde-, Mitglieds- und Kontaktdaten geben wir nicht an die Universität Stuttgart weiter.</P>
        </>
      ),
    },
    {
      title: 'Besuch der Website',
      body: (
        <>
          <P>Beim Aufruf der Website werden technisch notwendige Verbindungsdaten (z. B. IP-Adresse, Zeitpunkt, aufgerufene Seite, Browser-Angaben) verarbeitet, damit die Seiten ausgeliefert werden können. Dies übernimmt unser Hosting-Anbieter Vercel (siehe Abschnitt 7). Nach der Dokumentation von Vercel werden Laufzeitprotokolle in dem von uns genutzten Tarif (Hobby) 1 Stunde lang vorgehalten. Weitere Verbindungsdaten verarbeitet Vercel nach eigenen Vorgaben. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (sicherer und zuverlässiger Betrieb der Website).</P>
          <P>Beim Absenden eines Formulars wird Ihre IP-Adresse kurzzeitig im Arbeitsspeicher des Servers verwendet, um übermäßig viele Anfragen zu begrenzen und Missbrauch zu verhindern. Sie wird nicht in unserer Datenbank gespeichert und nicht in die Benachrichtigungs-E-Mail aufgenommen (Art. 6 Abs. 1 lit. f DSGVO).</P>
          <P>Die Schriftarten (Vazirmatn, Playfair Display, Lalezar) werden von unserem eigenen Server ausgeliefert. Dafür wird keine Verbindung zu Google Fonts oder anderen Schriftdiensten aufgebaut.</P>
          <P>Die Website enthält Links zu Instagram und Telegram. Erst wenn Sie einen solchen Link anklicken, verlassen Sie unsere Website. Inhalte dieser Dienste werden nicht in unsere Seiten eingebettet.</P>
        </>
      ),
    },
    {
      title: 'Cookies, lokaler Speicher und Tracking',
      body: (
        <>
          <P>Für Besucherinnen und Besucher der öffentlichen Website gilt:</P>
          <UL>
            <li>Wir setzen keine Cookies.</li>
            <li>Wir verwenden keine Analyse-, Tracking- oder Werbedienste (kein Google Analytics, kein Vercel Web Analytics) und keine Google Forms.</li>
            <li>Wir nutzen weder den Sitzungsspeicher (sessionStorage) noch IndexedDB.</li>
          </UL>
          <P>Beim Besuch der Website schreibt Ihr Browser den Eintrag „didar-lang“ (fa oder de) in den lokalen Speicher (localStorage). Er enthält ausschließlich Ihre Sprachwahl, bleibt auf Ihrem Gerät, wird nicht an uns übertragen und von der Website nicht ausgelesen. Sie können ihn jederzeit über die Einstellungen Ihres Browsers löschen.</P>
          <P>Nur nach der Anmeldung im Verwaltungsbereich (ausschließlich die beiden Administratoren) wird das Cookie „session_token“ gesetzt. Es dient der Anmeldung, ist 24 Stunden gültig und betrifft nur den Verwaltungsbereich. Besucher der öffentlichen Website erhalten dieses Cookie nicht.</P>
        </>
      ),
    },
    {
      title: 'Daten, die Sie über Formulare übermitteln',
      body: (
        <>
          <P>Wir verarbeiten nur die Angaben, die Sie selbst in ein Formular eingeben. Pflichtfelder sind erforderlich, damit wir Ihre Anfrage bearbeiten können; alle anderen Angaben sind freiwillig.</P>
          <UL>
            <li><strong>Veranstaltungsanmeldung:</strong> Vorname, Nachname, E-Mail-Adresse (Pflicht); Telefonnummer, Telegram-ID, Kommentar (freiwillig)</li>
            <li><strong>Mitgliedschaftsantrag:</strong> Vorname, Nachname, E-Mail-Adresse (Pflicht); Telefonnummer, Telegram-ID, zusätzliche Informationen (freiwillig)</li>
            <li><strong>Kontaktformular:</strong> Name, E-Mail-Adresse, Nachricht (Pflicht)</li>
          </UL>
          <P>Zusätzlich speichern wir den Zeitpunkt der Einreichung, bei Anmeldungen die gewählte Veranstaltung und einen internen Bearbeitungsstatus. Bei Anmeldungen und Mitgliedschaftsanträgen können die Administratoren interne Notizen ergänzen.</P>
          <P>Bitte geben Sie in den freien Textfeldern (Kommentar, zusätzliche Informationen, Nachricht) keine unnötigen sensiblen Daten an, etwa zu Gesundheit, religiösen Überzeugungen, politischen Meinungen oder zum Sexualleben. Wir benötigen solche Angaben nicht.</P>
        </>
      ),
    },
    {
      title: 'Ablauf der Bearbeitung',
      body: (
        <>
          <P>Anmeldungen, Anträge und Nachrichten werden bei uns manuell bearbeitet:</P>
          <UL>
            <li>Sie senden das Formular ab.</li>
            <li>Ihre Angaben werden sofort in unserer Datenbank gespeichert.</li>
            <li>An das Postfach didar.stuttgart@gmail.com wird über den Dienst Resend eine Benachrichtigung mit den übermittelten Angaben gesendet. Schlägt dieser Versand fehl, bleibt Ihre Einreichung trotzdem gespeichert.</li>
            <li>Die beiden Administratoren prüfen die Einreichung von Hand und melden sich gegebenenfalls mit den von Ihnen angegebenen Kontaktdaten bei Ihnen.</li>
          </UL>
          <P>Es gibt keine automatische Bestätigungs-E-Mail, keine E-Mail-Verifizierung, keine automatische Annahme und keine automatische Platzvergabe oder Kapazitätsprüfung. Eine automatisierte Entscheidungsfindung einschließlich Profiling findet nicht statt.</P>
        </>
      ),
    },
    {
      title: 'Zwecke und Rechtsgrundlagen',
      body: (
        <>
          <UL>
            <li><strong>Veranstaltungsanmeldung:</strong> Bearbeitung Ihrer Anmeldung und Kontakt zur Durchführung der Veranstaltung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Anmeldung auf Ihre Anfrage hin der Anbahnung der Teilnahme dient, im Übrigen Art. 6 Abs. 1 lit. f DSGVO (organisatorische Planung und Durchführung unserer Veranstaltungen).</li>
            <li><strong>Mitgliedschaftsantrag:</strong> Prüfung Ihres Antrags und Verwaltung der Mitgliedschaft. Die Mitgliedschaft ist kostenlos; es gibt keine Mitgliedsgebühr und keine Zahlung. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihr Antrag und die Mitgliedschaft rechtlich als Schritte zu einem Rechtsverhältnis auf Ihre Anfrage einzuordnen sind, im Übrigen Art. 6 Abs. 1 lit. f DSGVO (interne Organisation unserer Hochschulgruppe).</li>
            <li><strong>Kontaktanfragen:</strong> Beantwortung Ihrer Nachricht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Beantwortung von Anfragen), bei Anfragen zur Anbahnung einer Teilnahme oder Mitgliedschaft zusätzlich Art. 6 Abs. 1 lit. b DSGVO.</li>
            <li><strong>Betrieb und Sicherheit der Website, Abwehr von Missbrauch, Absicherung des Verwaltungsbereichs:</strong> Art. 6 Abs. 1 lit. f DSGVO.</li>
            <li><strong>Fotos und Videos:</strong> siehe Abschnitt 10.</li>
          </UL>
          <P>Kostenpflichtige Kurse: Teilnahmegebühren (zum Beispiel beim Kurs „Critical Thinking“) sind Gebühren für den Kurs selbst, keine Mitgliedsgebühren, und werden vor Ort in bar bezahlt. Die Website verarbeitet keine Zahlungen und speichert keine Zahlungsdaten.</P>
        </>
      ),
    },
    {
      title: 'Empfänger und Dienstleister',
      body: (
        <>
          <P>Wir verkaufen keine Daten. Ihre Angaben aus den Formularen gelangen nur an die folgenden Dienstleister, die uns bei Speicherung, Betrieb und Versand unterstützen:</P>
          <UL>
            <li><strong>Supabase</strong> (Datenbank): speichert die Einreichungen aus den Formularen und die Anmeldesitzungen der Administratoren. Die Datenbank befindet sich in der EU (Region Irland). Der Anbieter ist ein US-Unternehmen.</li>
            <li><strong>Vercel Inc.</strong> (Hosting): liefert die Website aus und führt die Serverfunktionen aus, über die Formulare verarbeitet werden. Die Serverfunktionen laufen in der EU-Region Dublin (Irland). Der Anbieter ist ein US-Unternehmen.</li>
            <li><strong>Resend</strong> (E-Mail-Versand): versendet die Benachrichtigung an die Administratoren. Sie enthält die übermittelten Angaben. Nach den Angaben von Resend werden Versandprotokolle 30 Tage aufbewahrt. Der Anbieter ist ein US-Unternehmen.</li>
            <li><strong>Google</strong> (Anbieter des E-Mail-Postfachs didar.stuttgart@gmail.com): empfängt und speichert die Benachrichtigungs-E-Mails und weitere E-Mail-Korrespondenz mit uns.</li>
          </UL>
          <P>Wenn Sie uns eine Telegram-ID angeben, können wir Sie darüber kontaktieren; dabei gelten die Datenschutzbestimmungen von Telegram.</P>
          <P>Instagram (Meta) und Telegram sind keine Auftragsverarbeiter für Ihre Formulardaten. Sie sind für die dort veröffentlichten Fotos, Videos und Beiträge jeweils eigene Verantwortliche (siehe Abschnitt 10).</P>
          <P>Der Quellcode der Website, einschließlich einiger Bilddateien, ist öffentlich auf GitHub einsehbar. Formulardaten sind dort nicht enthalten.</P>
        </>
      ),
    },
    {
      title: 'Übermittlung in Drittländer',
      body: (
        <>
          <P>Mehrere der genannten Anbieter sind US-Unternehmen. Eine Verarbeitung oder ein Zugriff außerhalb der EU kann daher nicht ausgeschlossen werden. Wir stützen uns dabei auf die Garantien der Anbieter; absolute Sicherheit können wir nicht zusagen:</P>
          <UL>
            <li><strong>Vercel:</strong> Zertifizierung unter dem EU-US Data Privacy Framework (DPF) sowie Standardvertragsklauseln im Auftragsverarbeitungsvertrag.</li>
            <li><strong>Resend:</strong> Standardvertragsklauseln und DPF. Der DPF-Eintrag von Resend trägt derzeit den Status „aktiv – Re-Zertifizierung in Prüfung“.</li>
            <li><strong>Google:</strong> DPF-Zertifizierung (aktiv).</li>
            <li><strong>Supabase:</strong> Die Daten liegen in der EU (Irland). Ein Zugriff aus den USA, etwa für Support oder Wartung, kann nicht ausgeschlossen werden; es gelten die vertraglichen Garantien des Anbieters. Supabase ist nach unserer Prüfung nicht im DPF-Verzeichnis gelistet.</li>
            <li><strong>Instagram (Meta) und Telegram:</strong> Für die dort veröffentlichten Inhalte gelten die Bedingungen und Garantien dieser Dienste. Meta Platforms trägt im DPF-Verzeichnis den Status „aktiv – Re-Zertifizierung in Prüfung“. Telegram nennt für Übermittlungen an Konzerngesellschaften Standardvertragsklauseln.</li>
          </UL>
          <P>Weitere Informationen zu diesen Garantien erhalten Sie auf Anfrage.</P>
        </>
      ),
    },
    {
      title: 'Speicherdauer und Löschung',
      body: (
        <>
          <P>Wir speichern Ihre Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist, höchstens aber:</P>
          <UL>
            <li><strong>Veranstaltungsanmeldungen:</strong> bis zu 3 Monate nach der Veranstaltung; bei einer Veranstaltungsreihe bis zu 3 Monate nach der letzten Sitzung.</li>
            <li><strong>Angenommene Mitgliedschaften:</strong> solange die Mitgliedschaft besteht, und bis zu 6 Monate nach ihrem Ende.</li>
            <li><strong>Abgelehnte oder zurückgezogene Mitgliedschaftsanträge:</strong> bis zu 3 Monate nach der Entscheidung.</li>
            <li><strong>Kontaktanfragen:</strong> bis zu 6 Monate nach Abschluss der Angelegenheit bzw. nach der letzten relevanten Kommunikation.</li>
            <li><strong>Resend:</strong> Versandprotokolle nach den Angaben von Resend 30 Tage.</li>
            <li><strong>Vercel:</strong> Laufzeitprotokolle nach der Dokumentation von Vercel im Tarif Hobby 1 Stunde.</li>
            <li><strong>CSV-Exporte</strong> (falls erstellt): werden nach Gebrauch gelöscht.</li>
          </UL>
          <P>Die Löschung erfolgt manuell durch die beiden Administratoren. Wir löschen Datensätze nicht automatisch. Berücksichtigt werden dabei die Einträge in der Datenbank (Supabase), die Benachrichtigungs-E-Mails im Postfach sowie gegebenenfalls erstellte CSV-Exporte. Protokolle und Sicherungskopien, die bei den Dienstleistern liegen, unterliegen deren eigenen Aufbewahrungs- und Löschmechanismen; wir können sie nicht selbst löschen.</P>
          <P>Die Fristen können sich verlängern, soweit dies gesetzlich vorgeschrieben ist oder wir die Daten zur Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen benötigen. Für Unterlagen zu Barzahlungen bei kostenpflichtigen Kursen können gesetzliche Aufbewahrungspflichten bestehen; sie sind von den hier genannten Fristen für die Daten dieser Website zu unterscheiden und werden hier nicht angegeben.</P>
        </>
      ),
    },
    {
      title: 'Fotos und Videos',
      body: (
        <>
          <P>Bei Didar-Veranstaltungen können Fotos und Videos aufgenommen werden. Sie können auf der Didar-Website, auf Instagram und im Telegram-Kanal veröffentlicht werden.</P>
          <P>Wenn Sie nicht abgebildet werden möchten oder die Entfernung eines Fotos oder Videos wünschen, schreiben Sie uns an info@didar-stuttgart.com. Wir entfernen es dann von unseren eigenen Kanälen. Die Veröffentlichung stützen wir auf Art. 6 Abs. 1 lit. f DSGVO (Berichterstattung über unsere Aktivitäten); Sie können ihr aus Gründen, die sich aus Ihrer besonderen Situation ergeben, widersprechen (Art. 21 DSGVO). Bitte beachten Sie: Die Entfernung von unseren eigenen Kanälen kann nicht garantieren, dass Kopien, die Dritte bereits heruntergeladen, gespeichert oder weiterverbreitet haben, ebenfalls verschwinden. Für die Verarbeitung bei Instagram (Meta) und Telegram sind diese Dienste selbst verantwortlich.</P>
        </>
      ),
    },
    {
      title: 'Ihre Rechte',
      body: (
        <>
          <P>Sie haben nach der DSGVO folgende Rechte:</P>
          <UL>
            <li>Auskunft über Ihre gespeicherten Daten (Art. 15)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16)</li>
            <li>Löschung, soweit keine Ausnahme greift (Art. 17)</li>
            <li>Einschränkung der Verarbeitung (Art. 18)</li>
            <li>Datenübertragbarkeit, soweit die Verarbeitung auf Einwilligung oder Vertrag beruht und automatisiert erfolgt (Art. 20)</li>
            <li>Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO aus Gründen, die sich aus Ihrer besonderen Situation ergeben (Art. 21)</li>
            <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft</li>
          </UL>
          <P>Zur Ausübung Ihrer Rechte schreiben Sie uns an info@didar-stuttgart.com. Wir antworten grundsätzlich innerhalb eines Monats.</P>
          <P>Außerdem haben Sie das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für uns ist der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg zuständig: <a href={LFDI_URL} target="_blank" rel="noopener noreferrer">baden-wuerttemberg.datenschutz.de</a>.</P>
        </>
      ),
    },
    {
      title: 'Datensicherheit',
      body: (
        <>
          <P>Die Website wird verschlüsselt über HTTPS ausgeliefert. Der Zugriff auf die Datenbank und den Verwaltungsbereich ist auf die beiden Administratoren beschränkt; der Verwaltungsbereich ist durch eine Anmeldung geschützt. Absolute Sicherheit bei der Datenübertragung und -speicherung kann es nicht geben.</P>
        </>
      ),
    },
    {
      title: 'Kontakt zum Datenschutz',
      body: (
        <>
          <P>
            Bei Fragen zum Datenschutz erreichen Sie uns unter:<br />
            Didar – Hochschulgruppe an der Universität Stuttgart<br />
            Pfaffenwaldring 5c, 70569 Stuttgart, Deutschland<br />
            E-Mail: info@didar-stuttgart.com<br />
            Telefon: +49 155 11250722
          </P>
        </>
      ),
    },
    {
      title: 'Änderungen dieser Erklärung',
      body: (
        <>
          <P>Wir passen diese Datenschutzerklärung an, wenn sich unsere Verarbeitung oder die Rechtslage ändert. Die jeweils aktuelle Fassung finden Sie auf dieser Seite.</P>
        </>
      ),
    },
  ],
};

const fa = {
  updated: 'آخرین به‌روزرسانی: اکتبر ۲۰۲۶',
  sections: [
    {
      title: 'مسئولان پردازش داده',
      body: (
        <>
          <P>مسئولان پردازش داده‌های شخصی در این وب‌سایت، بر اساس مقررات عمومی حفاظت از داده‌ها (GDPR)، این دو نفر هستند:</P>
          <UL>
            <li>Danial Haghgoo</li>
            <li>Sayedali Yarahmadian (که در وب‌سایت و در رویدادها با نام عمومی «آوید» / Avid نیز شناخته می‌شود)</li>
          </UL>
          <P>
            دیدار – Hochschulgruppe an der Universität Stuttgart<br />
            Pfaffenwaldring 5c, 70569 Stuttgart, Deutschland<br />
            ایمیل: info@didar-stuttgart.com<br />
            تلفن: ‎+49 155 11250722
          </P>
          <P>فقط همین دو نفر به بخش مدیریت و پایگاه داده دسترسی دارند. داده‌های ثبت‌نام، عضویت و تماس را به دانشگاه اشتوتگارت (Universität Stuttgart) منتقل نمی‌کنیم.</P>
        </>
      ),
    },
    {
      title: 'بازدید از وب‌سایت',
      body: (
        <>
          <P>هنگام باز کردن وب‌سایت، داده‌های اتصال لازم از نظر فنی (مثلاً نشانی IP، زمان، صفحه درخواست‌شده، اطلاعات مرورگر) پردازش می‌شوند تا صفحه‌ها نمایش داده شوند. این کار را ارائه‌دهندهٔ میزبانی ما، Vercel، انجام می‌دهد (بخش ۷ را ببینید). طبق مستندات Vercel، گزارش‌های زمان اجرا در طرح مورد استفادهٔ ما (Hobby) به مدت ۱ ساعت نگهداری می‌شوند. سایر داده‌های اتصال را Vercel طبق مقررات خودش پردازش می‌کند. مبنای حقوقی، ماده ۶ (۱)(f) GDPR است (عملکرد امن و قابل‌اعتماد وب‌سایت).</P>
          <P>هنگام ارسال یک فرم، نشانی IP شما برای مدت کوتاهی در حافظهٔ موقت سرور استفاده می‌شود تا تعداد درخواست‌های بیش‌ازحد محدود شود و از سوءاستفاده جلوگیری گردد. این نشانی در پایگاه دادهٔ ما ذخیره نمی‌شود و در ایمیل اطلاع‌رسانی نیز نمی‌آید (ماده ۶ (۱)(f) GDPR).</P>
          <P>فونت‌ها (Vazirmatn، Playfair Display و Lalezar) از سرور خودمان ارائه می‌شوند. برای این کار هیچ اتصالی به Google Fonts یا سرویس‌های فونت دیگر برقرار نمی‌شود.</P>
          <P>وب‌سایت شامل پیوند به اینستاگرام و تلگرام است. فقط وقتی روی چنین پیوندی کلیک کنید، وب‌سایت ما را ترک می‌کنید. محتوای این سرویس‌ها در صفحه‌های ما جاسازی نشده است.</P>
        </>
      ),
    },
    {
      title: 'کوکی‌ها، حافظهٔ محلی و ردیابی',
      body: (
        <>
          <P>برای بازدیدکنندگان وب‌سایت عمومی:</P>
          <UL>
            <li>ما هیچ کوکی‌ای تنظیم نمی‌کنیم.</li>
            <li>ما از هیچ سرویس تحلیل، ردیابی یا تبلیغاتی استفاده نمی‌کنیم (نه Google Analytics، نه Vercel Web Analytics) و از Google Forms هم استفاده نمی‌کنیم.</li>
            <li>ما نه از sessionStorage و نه از IndexedDB استفاده می‌کنیم.</li>
          </UL>
          <P>هنگام بازدید از وب‌سایت، مرورگر شما مقدار «didar-lang» (fa یا de) را در حافظهٔ محلی (localStorage) می‌نویسد. این مقدار فقط شامل انتخاب زبان شماست، روی دستگاه شما می‌ماند، به ما ارسال نمی‌شود و وب‌سایت آن را نمی‌خواند. می‌توانید هر زمان آن را از تنظیمات مرورگر پاک کنید.</P>
          <P>فقط پس از ورود به بخش مدیریت (که فقط آن دو مدیر وارد می‌شوند) کوکی «session_token» تنظیم می‌شود. این کوکی برای ورود به‌کار می‌رود، ۲۴ ساعت اعتبار دارد و فقط به بخش مدیریت مربوط است. بازدیدکنندگان وب‌سایت عمومی این کوکی را دریافت نمی‌کنند.</P>
        </>
      ),
    },
    {
      title: 'داده‌هایی که از طریق فرم‌ها ارسال می‌کنید',
      body: (
        <>
          <P>ما فقط اطلاعاتی را پردازش می‌کنیم که خودتان در یک فرم وارد می‌کنید. فیلدهای الزامی برای رسیدگی به درخواست شما لازم‌اند؛ سایر اطلاعات اختیاری است.</P>
          <UL>
            <li><strong>ثبت‌نام در رویداد:</strong> نام، نام خانوادگی، آدرس ایمیل (الزامی)؛ شمارهٔ تلفن، شناسهٔ تلگرام، توضیحات (اختیاری)</li>
            <li><strong>درخواست عضویت:</strong> نام، نام خانوادگی، آدرس ایمیل (الزامی)؛ شمارهٔ تلفن، شناسهٔ تلگرام، اطلاعات اضافی (اختیاری)</li>
            <li><strong>فرم تماس:</strong> نام، آدرس ایمیل، پیام (الزامی)</li>
          </UL>
          <P>علاوه بر این، زمان ارسال، در ثبت‌نام‌ها، رویداد انتخاب‌شده و یک وضعیت داخلی رسیدگی را ذخیره می‌کنیم. در ثبت‌نام‌ها و درخواست‌های عضویت، مدیران می‌توانند یادداشت‌های داخلی اضافه کنند.</P>
          <P>لطفاً در فیلدهای متنی آزاد (توضیحات، اطلاعات اضافی، پیام) اطلاعات حساس غیرضروری، مثلاً دربارهٔ سلامت، باورهای دینی، دیدگاه‌های سیاسی یا زندگی جنسی، وارد نکنید. ما به چنین اطلاعاتی نیاز نداریم.</P>
        </>
      ),
    },
    {
      title: 'روند رسیدگی',
      body: (
        <>
          <P>ثبت‌نام‌ها، درخواست‌ها و پیام‌ها نزد ما به‌صورت دستی بررسی می‌شوند:</P>
          <UL>
            <li>شما فرم را ارسال می‌کنید.</li>
            <li>اطلاعات شما بلافاصله در پایگاه دادهٔ ما ذخیره می‌شود.</li>
            <li>از طریق سرویس Resend یک اطلاع‌رسانی حاوی اطلاعات ارسال‌شده به صندوق ایمیل didar.stuttgart@gmail.com فرستاده می‌شود. اگر این ارسال با شکست مواجه شود، اطلاعات شما همچنان ذخیره می‌ماند.</li>
            <li>دو مدیر، ارسال شما را دستی بررسی می‌کنند و در صورت لزوم با اطلاعات تماسی که داده‌اید با شما ارتباط می‌گیرند.</li>
          </UL>
          <P>ایمیل تأیید خودکار، تأیید ایمیل، پذیرش خودکار و تخصیص خودکار جا یا بررسی ظرفیت وجود ندارد. تصمیم‌گیری خودکار، از جمله پروفایل‌سازی، انجام نمی‌شود.</P>
        </>
      ),
    },
    {
      title: 'اهداف و مبانی حقوقی',
      body: (
        <>
          <UL>
            <li><strong>ثبت‌نام در رویداد:</strong> رسیدگی به ثبت‌نام شما و ارتباط برای برگزاری رویداد. مبنای حقوقی، ماده ۶ (۱)(b) GDPR است، تا جایی که ثبت‌نام به درخواست شما برای تدارک شرکت در رویداد انجام می‌شود، و در سایر موارد ماده ۶ (۱)(f) GDPR (برنامه‌ریزی و برگزاری سازمانی رویدادهای ما).</li>
            <li><strong>درخواست عضویت:</strong> بررسی درخواست شما و مدیریت عضویت. عضویت رایگان است؛ هیچ حق عضویت و پرداختی وجود ندارد. مبنای حقوقی، ماده ۶ (۱)(b) GDPR است، تا جایی که درخواست و عضویت از نظر حقوقی مراحلی به‌درخواست شما برای ایجاد یک رابطهٔ حقوقی به‌شمار می‌آیند، و در سایر موارد ماده ۶ (۱)(f) GDPR (سازمان‌دهی داخلی گروه دانشگاهی ما).</li>
            <li><strong>پیام‌های تماس:</strong> پاسخ به پیام شما. مبنای حقوقی، ماده ۶ (۱)(f) GDPR است (پاسخ به پرسش‌ها)، و در پرسش‌هایی دربارهٔ تدارک شرکت یا عضویت، افزون بر آن ماده ۶ (۱)(b) GDPR.</li>
            <li><strong>عملکرد و امنیت وب‌سایت، جلوگیری از سوءاستفاده، حفاظت از بخش مدیریت:</strong> ماده ۶ (۱)(f) GDPR.</li>
            <li><strong>عکس‌ها و ویدیوها:</strong> بخش ۱۰ را ببینید.</li>
          </UL>
          <P>دوره‌های پولی: هزینهٔ شرکت (برای نمونه در دورهٔ «Critical Thinking») هزینهٔ خود دوره است و حق عضویت نیست، و به‌صورت نقدی و حضوری پرداخت می‌شود. وب‌سایت هیچ پرداختی را پردازش نمی‌کند و هیچ داده پرداختی ذخیره نمی‌کند.</P>
        </>
      ),
    },
    {
      title: 'گیرندگان و ارائه‌دهندگان خدمات',
      body: (
        <>
          <P>ما داده‌ای نمی‌فروشیم. اطلاعات فرم‌های شما فقط به ارائه‌دهندگان خدمات زیر می‌رسد که ما را در ذخیره‌سازی، اجرا و ارسال یاری می‌کنند:</P>
          <UL>
            <li><strong>Supabase</strong> (پایگاه داده): ارسال‌های فرم‌ها و نشست‌های ورود مدیران را ذخیره می‌کند. پایگاه داده در اتحادیهٔ اروپا (منطقهٔ ایرلند) قرار دارد. این ارائه‌دهنده شرکتی آمریکایی است.</li>
            <li><strong>Vercel Inc.</strong> (میزبانی): وب‌سایت را ارائه می‌دهد و توابع سروری را اجرا می‌کند که فرم‌ها از طریق آن‌ها پردازش می‌شوند. توابع سروری در منطقهٔ اتحادیهٔ اروپا، دوبلین (ایرلند) اجرا می‌شوند. این ارائه‌دهنده شرکتی آمریکایی است.</li>
            <li><strong>Resend</strong> (ارسال ایمیل): اطلاع‌رسانی را برای مدیران می‌فرستد. این پیام شامل اطلاعات ارسال‌شده است. طبق اطلاعات Resend، گزارش‌های ارسال ۳۰ روز نگهداری می‌شوند. این ارائه‌دهنده شرکتی آمریکایی است.</li>
            <li><strong>Google</strong> (ارائه‌دهندهٔ صندوق ایمیل didar.stuttgart@gmail.com): ایمیل‌های اطلاع‌رسانی و سایر مکاتبات ایمیلی با ما را دریافت و ذخیره می‌کند.</li>
          </UL>
          <P>اگر شناسهٔ تلگرام بدهید، می‌توانیم از آن طریق با شما تماس بگیریم؛ در این حالت مقررات حریم خصوصی تلگرام اعمال می‌شود.</P>
          <P>اینستاگرام (Meta) و تلگرام پردازشگر داده‌های فرم شما نیستند. آن‌ها برای عکس‌ها، ویدیوها و پست‌هایی که در آنجا منتشر می‌شود، هر کدام مسئول پردازش مستقل خود هستند (بخش ۱۰ را ببینید).</P>
          <P>کد منبع وب‌سایت، از جمله برخی فایل‌های تصویری، به‌صورت عمومی در GitHub قابل مشاهده است. داده‌های فرم‌ها در آنجا نیست.</P>
        </>
      ),
    },
    {
      title: 'انتقال به کشورهای ثالث',
      body: (
        <>
          <P>چند مورد از ارائه‌دهندگان نام‌برده شرکت‌های آمریکایی هستند. بنابراین پردازش یا دسترسی خارج از اتحادیهٔ اروپا را نمی‌توان کنار گذاشت. ما به تضمین‌های ارائه‌دهندگان تکیه می‌کنیم؛ امنیت مطلق را نمی‌توانیم تعهد کنیم:</P>
          <UL>
            <li><strong>Vercel:</strong> گواهی‌نامه در چارچوب EU-US Data Privacy Framework (DPF) و همچنین بندهای قراردادی استاندارد (SCC) در قرارداد پردازش داده.</li>
            <li><strong>Resend:</strong> بندهای قراردادی استاندارد و DPF. ثبت Resend در فهرست DPF اکنون وضعیت «فعال – بازبینی گواهی در دست بررسی» دارد.</li>
            <li><strong>Google:</strong> گواهی‌نامهٔ DPF (فعال).</li>
            <li><strong>Supabase:</strong> داده‌ها در اتحادیهٔ اروپا (ایرلند) قرار دارند. دسترسی از آمریکا، مثلاً برای پشتیبانی یا نگهداری، را نمی‌توان کنار گذاشت؛ تضمین‌های قراردادی ارائه‌دهنده اعمال می‌شود. بر اساس بررسی ما، Supabase در فهرست DPF ثبت نشده است.</li>
            <li><strong>اینستاگرام (Meta) و تلگرام:</strong> برای محتوای منتشرشده در آنجا، شرایط و تضمین‌های همان سرویس‌ها اعمال می‌شود. Meta Platforms در فهرست DPF وضعیت «فعال – بازبینی گواهی در دست بررسی» دارد. تلگرام برای انتقال به شرکت‌های گروه خود به بندهای قراردادی استاندارد اشاره می‌کند.</li>
          </UL>
          <P>اطلاعات بیشتر دربارهٔ این تضمین‌ها را در صورت درخواست ارائه می‌کنیم.</P>
        </>
      ),
    },
    {
      title: 'مدت نگهداری و حذف',
      body: (
        <>
          <P>ما داده‌های شما را فقط تا زمانی نگه می‌داریم که برای هدف مربوطه لازم است، و حداکثر:</P>
          <UL>
            <li><strong>ثبت‌نام در رویدادها:</strong> تا ۳ ماه پس از رویداد؛ در مجموعه‌رویدادها تا ۳ ماه پس از آخرین جلسه.</li>
            <li><strong>عضویت‌های پذیرفته‌شده:</strong> تا زمانی که عضویت برقرار است، و تا ۶ ماه پس از پایان آن.</li>
            <li><strong>درخواست‌های عضویت ردشده یا پس‌گرفته‌شده:</strong> تا ۳ ماه پس از تصمیم.</li>
            <li><strong>پیام‌های تماس:</strong> تا ۶ ماه پس از ختم موضوع یا پس از آخرین مکاتبهٔ مرتبط.</li>
            <li><strong>Resend:</strong> گزارش‌های ارسال طبق اطلاعات Resend، ۳۰ روز.</li>
            <li><strong>Vercel:</strong> گزارش‌های زمان اجرا طبق مستندات Vercel در طرح Hobby، ۱ ساعت.</li>
            <li><strong>خروجی‌های CSV</strong> (در صورت ایجاد): پس از استفاده حذف می‌شوند.</li>
          </UL>
          <P>حذف به‌صورت دستی توسط دو مدیر انجام می‌شود. ما رکوردها را به‌صورت خودکار حذف نمی‌کنیم. در این کار موارد زیر در نظر گرفته می‌شوند: رکوردهای پایگاه داده (Supabase)، ایمیل‌های اطلاع‌رسانی در صندوق ایمیل، و در صورت وجود، خروجی‌های CSV. گزارش‌ها و نسخه‌های پشتیبان نزد ارائه‌دهندگان خدمات تابع سازوکارهای نگهداری و حذف خود آن‌ها هستند؛ ما نمی‌توانیم آن‌ها را مستقیماً حذف کنیم.</P>
          <P>این مدت‌ها ممکن است طولانی‌تر شوند، تا جایی که قانون الزام کند یا ما برای طرح، اِعمال یا دفاع از ادعاهای حقوقی به داده‌ها نیاز داشته باشیم. برای مدارک مربوط به پرداخت‌های نقدی در دوره‌های پولی ممکن است تعهدات قانونی نگهداری وجود داشته باشد؛ این‌ها از مدت‌های یادشده برای داده‌های این وب‌سایت جدا هستند و در اینجا ذکر نمی‌شوند.</P>
        </>
      ),
    },
    {
      title: 'عکس‌ها و ویدیوها',
      body: (
        <>
          <P>در رویدادهای دیدار ممکن است عکس و ویدیو گرفته شود. این‌ها ممکن است در وب‌سایت دیدار، در اینستاگرام و در کانال تلگرام منتشر شوند.</P>
          <P>اگر نمی‌خواهید در تصویر باشید یا حذف یک عکس یا ویدیو را می‌خواهید، به info@didar-stuttgart.com بنویسید. در این صورت آن را از کانال‌های خودمان حذف می‌کنیم. انتشار را بر ماده ۶ (۱)(f) GDPR (گزارش دربارهٔ فعالیت‌های ما) مبتنی می‌کنیم؛ شما می‌توانید به دلایلی که از وضعیت خاص شما ناشی می‌شود به آن اعتراض کنید (ماده ۲۱ GDPR). لطفاً توجه کنید: حذف از کانال‌های خودمان نمی‌تواند تضمین کند که نسخه‌هایی که اشخاص ثالث پیش‌تر دانلود، ذخیره یا بازنشر کرده‌اند نیز ناپدید شوند. پردازش در اینستاگرام (Meta) و تلگرام بر عهدهٔ خود آن سرویس‌هاست.</P>
        </>
      ),
    },
    {
      title: 'حقوق شما',
      body: (
        <>
          <P>بر اساس GDPR حقوق زیر را دارید:</P>
          <UL>
            <li>دسترسی به داده‌های ذخیره‌شدهٔ خود (ماده ۱۵)</li>
            <li>اصلاح داده‌های نادرست (ماده ۱۶)</li>
            <li>حذف، تا جایی که استثنایی اعمال نشود (ماده ۱۷)</li>
            <li>محدودسازی پردازش (ماده ۱۸)</li>
            <li>قابلیت انتقال داده، تا جایی که پردازش بر پایهٔ رضایت یا قرارداد باشد و به‌صورت خودکار انجام شود (ماده ۲۰)</li>
            <li>اعتراض به پردازش‌هایی که بر ماده ۶ (۱)(f) GDPR مبتنی‌اند، به دلایلی که از وضعیت خاص شما ناشی می‌شود (ماده ۲۱)</li>
            <li>پس‌گرفتن رضایت داده‌شده برای آینده</li>
          </UL>
          <P>برای اعمال حقوق خود به info@didar-stuttgart.com بنویسید. ما اصولاً ظرف یک ماه پاسخ می‌دهیم.</P>
          <P>همچنین حق دارید به یک نهاد نظارتی حفاظت از داده‌ها شکایت کنید. نهاد صلاحیت‌دار برای ما، Landesbeauftragter für den Datenschutz und die Informationsfreiheit Baden-Württemberg است: <a href={LFDI_URL} target="_blank" rel="noopener noreferrer">baden-wuerttemberg.datenschutz.de</a>.</P>
        </>
      ),
    },
    {
      title: 'امنیت داده‌ها',
      body: (
        <>
          <P>وب‌سایت به‌صورت رمزگذاری‌شده از طریق HTTPS ارائه می‌شود. دسترسی به پایگاه داده و بخش مدیریت به دو مدیر محدود است؛ بخش مدیریت با ورود (لاگین) محافظت می‌شود. امنیت مطلق در انتقال و ذخیرهٔ داده وجود ندارد.</P>
        </>
      ),
    },
    {
      title: 'تماس دربارهٔ حفاظت از داده‌ها',
      body: (
        <>
          <P>
            برای پرسش‌های مربوط به حفاظت از داده‌ها با ما در تماس باشید:<br />
            دیدار – Hochschulgruppe an der Universität Stuttgart<br />
            Pfaffenwaldring 5c, 70569 Stuttgart, Deutschland<br />
            ایمیل: info@didar-stuttgart.com<br />
            تلفن: ‎+49 155 11250722
          </P>
        </>
      ),
    },
    {
      title: 'تغییرات این بیانیه',
      body: (
        <>
          <P>هرگاه پردازش ما یا وضعیت حقوقی تغییر کند، این بیانیهٔ حریم خصوصی را به‌روز می‌کنیم. نسخهٔ جاری همیشه در همین صفحه است.</P>
        </>
      ),
    },
  ],
};

const content = { de, fa };

export default function Datenschutz({ currentLang }) {
  const lang = currentLang === 'fa' ? 'fa' : 'de';
  const dir = lang === 'fa' ? 'rtl' : 'ltr';
  const page = content[lang];

  return (
    <>
      <Head>
        <title>{t('legal.datenschutz', lang)} - {lang === 'fa' ? 'دیدار' : 'Didar'}</title>
      </Head>

      <section className="section" dir={dir}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <Link href="/" className="btn btn-tertiary mb-8">
            {lang === 'fa' ? '→' : '←'} {t('common.back', lang)}
          </Link>

          <h1>{t('legal.datenschutz', lang)}</h1>

          <div className="mt-8">
            <p className="mt-6">{page.updated}</p>
            {page.sections.map((section, i) => (
              <div key={section.title}>
                <h2 className="mt-12">
                  {lang === 'fa' ? toFaNumber(i + 1) : i + 1}. {section.title}
                </h2>
                {section.body}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
