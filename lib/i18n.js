/**
 * i18n — Language & Translation Utilities
 * Manages Persian (فارسی) and German (Deutsch) content
 */

export const languages = {
  fa: { name: 'فارسی', dir: 'rtl', label: 'فارسی' },
  de: { name: 'Deutsch', dir: 'ltr', label: 'Deutsch' },
};

export const defaultLanguage = 'fa';

/**
 * Translations Object
 * Flat structure for simplicity (no nested objects)
 */
export const translations = {
  /* Navigation */
  'nav.home': { fa: 'خانه', de: 'Startseite' },
  'nav.events': { fa: 'رویدادها', de: 'Veranstaltungen' },
  'nav.about': { fa: 'درباره ما', de: 'Über uns' },
  'nav.membership': { fa: 'عضویت', de: 'Mitgliedschaft' },
  'nav.contact': { fa: 'تماس', de: 'Kontakt' },

  /* Common */
  'common.loading': { fa: 'در حال بارگذاری...', de: 'Wird geladen...' },
  'common.error': { fa: 'خطا', de: 'Fehler' },
  'common.success': { fa: 'موفق', de: 'Erfolg' },
  'common.learn_more': { fa: 'بیشتر بدانید', de: 'Mehr erfahren' },
  'common.back': { fa: 'بازگشت', de: 'Zurück' },
  'common.close': { fa: 'بستن', de: 'Schließen' },
  'common.send': { fa: 'ارسال', de: 'Senden' },
  'common.submit': { fa: 'ارسال', de: 'Senden' },
  'common.cancel': { fa: 'لغو', de: 'Abbrechen' },
  'common.save': { fa: 'ذخیره', de: 'Speichern' },
  'common.view_more': { fa: 'مشاهده بیشتر', de: 'Mehr anzeigen' },

  /* Home */
  'home.title': { fa: 'دیدار', de: 'DIDAR' },
  'home.subtitle': { fa: 'انجمن فرهنگی دیدار — شاهکارهای فرهنگی ایرانی در شتوتگارت',
                      de: 'Iranische Kulturgemeinschaft Stuttgart – Hochschulgruppe' },
  'home.hero_cta': { fa: 'درباره ما', de: 'Über uns' },
  'home.upcoming_events': { fa: 'رویدادهای آینده', de: 'Kommende Veranstaltungen' },
  'home.all_events': { fa: 'تمام رویدادها', de: 'Alle Veranstaltungen' },
  'home.about_section': { fa: 'درباره دیدار', de: 'Über DIDAR' },
  'home.about_text': { fa: 'دیدار یک انجمن فرهنگی است که به ارتقای تبادل فرهنگی و هنری ایرانی در شتوتگارت اختصاص دارد.',
                        de: 'DIDAR ist eine kulturelle Vereinigung, die dem Austausch iranischer Kultur und Kunst in Stuttgart gewidmet ist.' },
  'home.membership_section': { fa: 'به عنوان عضو بپیوندید', de: 'Mitglied werden' },
  'home.membership_text': { fa: 'بخشی از جامعه دیدار شوید و در رویدادهای فرهنگی شرکت کنید.',
                            de: 'Werden Sie Teil der DIDAR-Gemeinschaft und nehmen Sie an kulturellen Veranstaltungen teil.' },
  'home.membership_cta': { fa: 'درخواست عضویت', de: 'Mitgliedschaft beantragen' },

  /* Events */
  'events.title': { fa: 'رویدادها', de: 'Veranstaltungen' },
  'events.upcoming': { fa: 'رویدادهای آینده', de: 'Kommende Veranstaltungen' },
  'events.past': { fa: 'رویدادهای گذشته', de: 'Vergangene Veranstaltungen' },
  'events.no_upcoming': { fa: 'هیچ رویدادی برنامه ریزی نشده است.', de: 'Derzeit sind keine Veranstaltungen geplant.' },
  'events.registration_open': { fa: 'ثبت نام باز است', de: 'Anmeldung geöffnet' },
  'events.registration_closed': { fa: 'ثبت نام بسته است', de: 'Anmeldung geschlossen' },
  'events.past_event': { fa: 'برگزار شده', de: 'Vergangen' },

  /* Event Detail */
  'event.title': { fa: 'جزئیات رویدادها', de: 'Veranstaltungsdetails' },
  'event.date': { fa: 'تاریخ', de: 'Datum' },
  'event.time': { fa: 'زمان', de: 'Uhrzeit' },
  'event.location': { fa: 'مکان', de: 'Ort' },
  'event.description': { fa: 'توضیحات', de: 'Beschreibung' },
  'event.register': { fa: 'ثبت نام در این رویداد', de: 'Für diese Veranstaltung anmelden' },
  'event.back_to_events': { fa: 'بازگشت به رویدادها', de: 'Zurück zu Veranstaltungen' },

  /* About */
  'about.title': { fa: 'درباره دیدار', de: 'Über DIDAR' },
  'about.intro': { fa: 'دیدار — انجمن فرهنگی دیدار',
                   de: 'DIDAR — Iranische Kulturgemeinschaft Stuttgart – Hochschulgruppe' },
  'about.mission': { fa: 'ماموریت', de: 'Unsere Mission' },
  'about.mission_text': { fa: 'دیدار تعهد دارد تا فرهنگ، هنر و حوار فرهنگی ایرانی را در شتوتگارت و فراتر از آن ارتقا دهد.',
                          de: 'DIDAR setzt sich dafür ein, iranische Kultur, Kunst und interkulturellen Dialog in Stuttgart und darüber hinaus zu fördern.' },

  /* Membership */
  'membership.title': { fa: 'عضویت', de: 'Mitgliedschaft' },
  'membership.intro': { fa: 'به عنوان عضو درباره ما', de: 'Mitgliedschaft bei DIDAR' },
  'membership.benefits': { fa: 'مزایای عضویت', de: 'Mitgliedschaftsvorteile' },
  'membership.form_title': { fa: 'درخواست عضویت', de: 'Mitgliedschaftsantrag' },
  'membership.form_intro': { fa: 'لطفاً فرم زیر را کامل کنید تا درخواست عضویت خود را ثبت کنید.',
                             de: 'Bitte füllen Sie das folgende Formular aus, um Ihren Mitgliedschaftsantrag einzureichen.' },
  'membership.response_time': { fa: 'ما معمولا در مدت ۱۴ روز پاسخ می دهیم.',
                                de: 'Wir antworten normalerweise innerhalb von 14 Tagen.' },

  /* Contact */
  'contact.title': { fa: 'تماس', de: 'Kontakt' },
  'contact.intro': { fa: 'سوالات یا پیشنهادات دارید؟ با ما تماس بگیرید.',
                     de: 'Haben Sie Fragen oder Vorschläge? Nehmen Sie Kontakt mit uns auf.' },
  'contact.form_title': { fa: 'فرم تماس', de: 'Kontaktformular' },
  'contact.name': { fa: 'نام', de: 'Name' },
  'contact.email': { fa: 'ایمیل', de: 'E-Mail' },
  'contact.message': { fa: 'پیام', de: 'Nachricht' },
  'contact.send': { fa: 'ارسال پیام', de: 'Nachricht senden' },

  /* Forms */
  'form.first_name': { fa: 'نام', de: 'Vorname' },
  'form.last_name': { fa: 'نام خانوادگی', de: 'Nachname' },
  'form.email': { fa: 'ایمیل', de: 'E-Mail-Adresse' },
  'form.phone': { fa: 'شماره تماس (اختیاری)', de: 'Telefonnummer (optional)' },
  'form.telegram': { fa: 'شناسه تلگرام (اختیاری)', de: 'Telegram-ID (optional)' },
  'form.message': { fa: 'پیام', de: 'Nachricht' },
  'form.additional_info': { fa: 'اطلاعات اضافی', de: 'Zusätzliche Informationen' },
  'form.privacy_notice': { fa: 'شما با سیاست حریم خصوصی ما موافقت می کنید.',
                           de: 'Ich akzeptiere die Datenschutzrichtlinie.' },
  'form.required': { fa: '(الزامی)', de: '(erforderlich)' },
  'form.success': { fa: 'درخواست شما دریافت شد. تأیید از طریق ایمیل برای شما ارسال خواهد شد.',
                    de: 'Ihre Anfrage wurde empfangen. Eine Bestätigung wird Ihnen per E-Mail zugesandt.' },
  'form.error': { fa: 'خطا در ارسال فرم. لطفاً دوباره امتحان کنید.',
                  de: 'Fehler beim Absenden des Formulars. Bitte versuchen Sie es später erneut.' },

  /* Footer */
  'footer.follow_us': { fa: 'ما را دنبال کنید', de: 'Folge uns' },
  'footer.contact': { fa: 'تماس', de: 'Kontakt' },
  'footer.legal': { fa: 'قانونی', de: 'Rechtlich' },
  'footer.impressum': { fa: 'اطلاعات شامل', de: 'Impressum' },
  'footer.datenschutz': { fa: 'سیاست حریم خصوصی', de: 'Datenschutz' },
  'footer.copyright': { fa: '© {{year}} دیدار. تمام حقوق محفوظ است.',
                        de: '© {{year}} DIDAR. Alle Rechte vorbehalten.' },

  /* Legal */
  'legal.impressum': { fa: 'اطلاعات شامل', de: 'Impressum' },
  'legal.datenschutz': { fa: 'سیاست حریم خصوصی', de: 'Datenschutz' },
  'legal.coming_soon': { fa: 'به زودی...', de: 'Demnächst...' },
};

/**
 * Get translation for key
 * @param {string} key - Translation key
 * @param {string} lang - Language code ('fa' or 'de')
 * @param {object} params - Optional parameters to replace in string
 * @returns {string} Translated string or key if not found
 */
export function t(key, lang = defaultLanguage, params = {}) {
  if (!translations[key]) {
    return key;
  }

  let text = translations[key][lang] || translations[key][defaultLanguage] || key;

  // Simple parameter replacement
  Object.keys(params).forEach((param) => {
    text = text.replace(`{{${param}}}`, params[param]);
  });

  return text;
}

/**
 * Get language direction (RTL/LTR)
 * @param {string} lang - Language code
 * @returns {string} 'rtl' or 'ltr'
 */
export function getDirection(lang) {
  return languages[lang]?.dir || 'ltr';
}

/**
 * Format date in language-specific format
 * @param {Date|string} date - Date to format
 * @param {string} lang - Language code
 * @returns {string} Formatted date string
 */
export function formatDate(date, lang) {
  const d = new Date(date);
  if (lang === 'fa') {
    // Simple Persian date format (DD ماه YYYY)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('fa-IR', options).format(d);
  }
  // German date format
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat('de-DE', options).format(d);
}

/**
 * Format time
 * @param {string} timeString - Time string (HH:MM)
 * @param {string} lang - Language code
 * @returns {string} Formatted time
 */
export function formatTime(timeString, lang) {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const min = parseInt(minutes, 10);

  if (lang === 'fa') {
    return `${hour}:${min.toString().padStart(2, '0')}`;
  }

  // 12-hour format for German
  const ampm = hour >= 12 ? 'Uhr' : 'Uhr';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${min.toString().padStart(2, '0')} ${ampm}`;
}
