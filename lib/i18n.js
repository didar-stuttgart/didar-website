/**
 * i18n — Language & Translation Utilities
 * Manages Persian (فارسی) and German (Deutsch) content
 */

export const languages = {
  fa: { name: 'فارسی', dir: 'rtl', label: 'فارسی', flag: 'فارسی' },
  de: { name: 'Deutsch', dir: 'ltr', label: 'Deutsch', flag: 'Deutsch' },
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
  'nav.skip_to_content': { fa: 'رفتن به محتوای اصلی', de: 'Zum Inhalt springen' },
  'nav.menu': { fa: 'منو', de: 'Menü' },
  'nav.close_menu': { fa: 'بستن منو', de: 'Menü schließen' },
  'nav.primary': { fa: 'ناوبری اصلی', de: 'Hauptnavigation' },
  'nav.languages': { fa: 'زبان', de: 'Sprache' },
  'nav.contact_cta': { fa: 'تماس با ما', de: 'Kontakt aufnehmen' },

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
  'home.brand_name': { fa: 'دیدار اشتوتگارت', de: 'DIDAR Stuttgart' },
  'home.hero_tagline': { fa: 'فرهنگ ایرانی در اشتوتگارت.', de: 'Persische Kultur in Stuttgart.' },
  'home.hero_description': { fa: 'ادبیات، هنر، فیلم و موسیقی — و فضایی برای دیدار.',
                              de: 'Literatur, Kunst, Film und Musik – und Raum für Begegnung.' },
  'home.cta_primary': { fa: 'رویدادها را ببینید', de: 'Veranstaltungen entdecken' },
  'home.cta_secondary': { fa: 'درباره دیدار', de: 'Über uns' },
  'home.cultural_areas_title': { fa: 'حوزه‌های فرهنگی', de: 'Kulturbereiche' },
  'home.community_title': { fa: 'با ما در ارتباط باشید', de: 'Bleiben Sie in Kontakt' },
  'home.community_text': { fa: 'برای اطلاع از رویدادها و اخبار دیدار، در تلگرام و اینستاگرام همراه ما باشید.',
                            de: 'Folgen Sie uns auf Telegram und Instagram, um über Veranstaltungen und Neuigkeiten informiert zu bleiben.' },

  /* Events */
  'events.title': { fa: 'رویدادها', de: 'Veranstaltungen' },
  'events.upcoming': { fa: 'رویدادهای آینده', de: 'Kommende Veranstaltungen' },
  'events.past': { fa: 'رویدادهای گذشته', de: 'Vergangene Veranstaltungen' },
  'events.no_upcoming': { fa: 'هیچ رویدادی برنامه ریزی نشده است.', de: 'Derzeit sind keine Veranstaltungen geplant.' },
  'events.registration_open': { fa: 'ثبت نام باز است', de: 'Anmeldung geöffnet' },
  'events.registration_closed': { fa: 'ثبت نام بسته است', de: 'Anmeldung geschlossen' },
  'events.past_event': { fa: 'برگزار شده', de: 'Vergangen' },
  'events.coming_soon': { fa: 'به زودی', de: 'Demnächst' },
  'events.location_tbd': { fa: 'مکان به زودی اعلام می‌شود', de: 'Ort wird bekannt gegeben' },
  'events.category': { fa: 'دسته‌بندی', de: 'Kategorie' },
  'events.language': { fa: 'زبان رویداد', de: 'Sprache' },

  /* Event Detail */
  'event.title': { fa: 'جزئیات رویدادها', de: 'Veranstaltungsdetails' },
  'event.date': { fa: 'تاریخ', de: 'Datum' },
  'event.time': { fa: 'زمان', de: 'Uhrzeit' },
  'event.location': { fa: 'مکان', de: 'Ort' },
  'event.description': { fa: 'توضیحات', de: 'Beschreibung' },
  'event.register': { fa: 'ثبت نام در این رویداد', de: 'Für diese Veranstaltung anmelden' },
  'event.registration_closed': { fa: 'ثبت نام برای این رویداد بسته شده است.', de: 'Die Anmeldung für diese Veranstaltung ist geschlossen.' },
  'event.coming_soon': { fa: 'به‌زودی برگزار می‌شود', de: 'Demnächst' },
  'event.coming_soon_message': { fa: 'تاریخ دقیق و امکان ثبت‌نام برای این رویداد به‌زودی اعلام می‌شود.', de: 'Genaues Datum und Anmeldemöglichkeit für diese Veranstaltung folgen in Kürze.' },
  'event.past_event': { fa: 'این رویداد برگزار شده است.', de: 'Diese Veranstaltung hat bereits stattgefunden.' },
  'event.duplicate_registration': { fa: 'شما قبلاً با این آدرس ایمیل ثبت نام کرده‌اید.', de: 'Sie haben sich mit dieser E-Mail-Adresse bereits angemeldet.' },
  'event.back_to_events': { fa: 'بازگشت به رویدادها', de: 'Zurück zu Veranstaltungen' },
  'event.category': { fa: 'دسته‌بندی', de: 'Kategorie' },
  'event.language': { fa: 'زبان', de: 'Sprache' },
  'event.status': { fa: 'وضعیت ثبت‌نام', de: 'Anmeldestatus' },
  'event.external_registration': { fa: 'ثبت‌نام', de: 'Zur Anmeldung' },

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
  'form.privacy_event_notice': { fa: 'اطلاعات شما برای ثبت‌نام در رویداد و ارتباط مرتبط استفاده خواهد شد. برای جزئیات بیشتر، لطفاً سیاست حریم خصوصی را مطالعه کنید.',
                                 de: 'Ihre Daten werden zur Registrierung für diese Veranstaltung und entsprechender Kommunikation verwendet. Für weitere Details lesen Sie bitte unsere Datenschutzerklärung.' },
  'form.privacy_membership_notice': { fa: 'درخواست عضویت شما پردازش و ارزیابی خواهد شد. اطلاعات شما محفوظ نگاه داشته خواهد شد.',
                                       de: 'Ihr Mitgliedschaftsantrag wird verarbeitet und bewertet. Ihre Daten werden sicher aufbewahrt.' },
  'form.privacy_contact_notice': { fa: 'پیام شما برای پاسخ‌دهی به سوال یا پیشنهاد شما استفاده خواهد شد.',
                                    de: 'Ihre Nachricht wird verwendet, um auf Ihre Frage oder Ihren Vorschlag zu antworten.' },
  'form.privacy_policy_link': { fa: 'سیاست حریم خصوصی',
                                de: 'Datenschutzerklärung' },
  'form.required': { fa: '(الزامی)', de: '(erforderlich)' },
  'form.success': { fa: 'درخواست شما دریافت شد. تأیید از طریق ایمیل برای شما ارسال خواهد شد.',
                    de: 'Ihre Anfrage wurde empfangen. Eine Bestätigung wird Ihnen per E-Mail zugesandt.' },
  'form.error': { fa: 'خطا در ارسال فرم. لطفاً دوباره امتحان کنید.',
                  de: 'Fehler beim Absenden des Formulars. Bitte versuchen Sie es später erneut.' },
  'form.validation_required': { fa: 'وارد کردن {{field}} الزامی است.', de: '{{field}} ist erforderlich.' },
  'form.validation_email': { fa: 'یک آدرس ایمیل معتبر وارد کنید.', de: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' },
  'form.validation_phone': { fa: 'شماره تماس معتبر نیست.', de: 'Die Telefonnummer ist ungültig.' },
  'form.validation_telegram': { fa: 'شناسه تلگرام معتبر نیست.', de: 'Die Telegram-ID ist ungültig.' },
  'form.validation_comment': { fa: 'پیام نمی‌تواند بیشتر از ۱۰۰۰ نویسه باشد.', de: 'Die Nachricht darf höchstens 1.000 Zeichen lang sein.' },

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

  /* Cultural Areas */
  'culture.literature_title': { fa: 'ادبیات', de: 'Literatur' },
  'culture.literature_text': { fa: 'شب‌های شعر و داستان و گفتگو درباره ادبیات فارسی و جهانی.',
                                de: 'Lese- und Gesprächsabende rund um persische und internationale Literatur.' },
  'culture.film_title': { fa: 'فیلم', de: 'Film' },
  'culture.film_text': { fa: 'نمایش و گفتگو درباره فیلم‌های ایرانی و بین‌المللی.',
                          de: 'Filmvorführungen und Gespräche über iranisches und internationales Kino.' },
  'culture.art_title': { fa: 'هنر', de: 'Kunst' },
  'culture.art_text': { fa: 'نمایشگاه‌ها و کارگاه‌های هنری با الهام از فرهنگ ایرانی.',
                         de: 'Ausstellungen und Workshops mit Bezug zur iranischen Kunst und Kultur.' },
  'culture.music_title': { fa: 'موسیقی', de: 'Musik' },
  'culture.music_text': { fa: 'اجراها و شب‌های موسیقی سنتی و معاصر ایرانی.',
                           de: 'Konzerte und Musikabende mit traditionellen und zeitgenössischen Klängen.' },
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
    // timeZone: 'UTC' pins the format to the date-only string's own calendar day,
    // regardless of the server's or the browser's local timezone (fixes SSR/CSR hydration mismatch).
    const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    return new Intl.DateTimeFormat('fa-IR', options).format(d);
  }
  // German date format
  const options = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
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
