/**
 * Small FA/DE dictionary for the admin pages (registrations, memberships, contact,
 * dashboard). Language follows the Next.js locale: /admin/... = Persian (RTL),
 * /de/admin/... = German (LTR).
 */

const STRINGS = {
  loading: { fa: 'درحال بارگذاری...', de: 'Wird geladen...' },
  back: { fa: '← بازگشت', de: '← Zurück' },
  retry: { fa: 'تلاش دوباره', de: 'Erneut versuchen' },
  load_error: { fa: 'بارگذاری اطلاعات ناموفق بود. لطفاً دوباره تلاش کنید.', de: 'Die Daten konnten nicht geladen werden. Bitte erneut versuchen.' },
  email: { fa: 'ایمیل:', de: 'E-Mail:' },
  phone: { fa: 'تلفن:', de: 'Telefon:' },
  telegram: { fa: 'تلگرام:', de: 'Telegram:' },
  notes: { fa: 'یادداشت:', de: 'Notiz:' },
  csv: { fa: '⬇️ دانلود CSV', de: '⬇️ CSV herunterladen' },
  sort_by: { fa: 'مرتب‌سازی', de: 'Sortieren' },
  status_new: { fa: 'جدید', de: 'Neu' },
  status_contacted: { fa: 'تماس گرفته شده', de: 'Kontaktiert' },
  status_confirmed: { fa: 'تأیید شده', de: 'Bestätigt' },
  status_accepted: { fa: 'تأیید شده', de: 'Angenommen' },
  status_declined: { fa: 'رد شده', de: 'Abgelehnt' },
  status_cancelled: { fa: 'لغو شده', de: 'Storniert' },

  // Registrations
  reg_title: { fa: 'ثبت‌نام‌ها — دیدار', de: 'Anmeldungen — Didar' },
  reg_heading: { fa: 'ثبت‌نام‌های رویدادها', de: 'Veranstaltungsanmeldungen' },
  reg_sort_date: { fa: 'جدیدترین اول', de: 'Neueste zuerst' },
  reg_sort_name: { fa: 'نام', de: 'Name' },
  reg_sort_status: { fa: 'وضعیت', de: 'Status' },
  reg_empty: { fa: 'هیچ ثبت‌نامی وجود ندارد', de: 'Keine Anmeldungen vorhanden' },
  reg_empty_filtered: { fa: 'برای این رویداد ثبت‌نامی وجود ندارد', de: 'Für diese Veranstaltung gibt es keine Anmeldungen' },
  reg_event: { fa: 'رویداد:', de: 'Veranstaltung:' },
  reg_date: { fa: 'تاریخ ثبت‌نام:', de: 'Angemeldet am:' },
  reg_cancelled_at: { fa: 'لغو شده در:', de: 'Storniert am:' },
  reg_comment: { fa: 'نوشته:', de: 'Nachricht:' },
  filter_event: { fa: 'رویداد', de: 'Veranstaltung' },
  all_events: { fa: 'همه رویدادها', de: 'Alle Veranstaltungen' },
  filter_events_error: { fa: 'فهرست رویدادها بارگذاری نشد. فیلتر ممکن است ناقص باشد.', de: 'Die Veranstaltungsliste konnte nicht geladen werden. Der Filter ist evtl. unvollständig.' },

  // Memberships
  mem_title: { fa: 'درخواست‌های عضویت — دیدار', de: 'Mitgliedsanträge — Didar' },
  mem_heading: { fa: 'درخواست‌های عضویت', de: 'Mitgliedsanträge' },
  mem_empty: { fa: 'هیچ درخواست عضویتی وجود ندارد', de: 'Keine Mitgliedsanträge vorhanden' },
  mem_date: { fa: 'تاریخ درخواست:', de: 'Beantragt am:' },
  mem_info: { fa: 'اطلاعات:', de: 'Angaben:' },

  // Contact
  con_title: { fa: 'پیام‌های تماس — دیدار', de: 'Kontaktnachrichten — Didar' },
  con_heading: { fa: 'پیام‌های تماس', de: 'Kontaktnachrichten' },
  con_empty: { fa: 'هیچ پیامی وجود ندارد', de: 'Keine Nachrichten vorhanden' },
  con_date: { fa: 'تاریخ ارسال:', de: 'Gesendet am:' },
  con_name: { fa: 'نام:', de: 'Name:' },
  con_message: { fa: 'پیام:', de: 'Nachricht:' },

  // Delete flow
  delete: { fa: 'حذف', de: 'Löschen' },
  delete_title: { fa: 'حذف این مورد؟', de: 'Diesen Eintrag löschen?' },
  delete_warning: { fa: 'این مورد برای همیشه از پایگاه داده حذف می‌شود و قابل بازگشت نیست.', de: 'Dieser Eintrag wird dauerhaft aus der Datenbank gelöscht und kann nicht wiederhergestellt werden.' },
  delete_cancel: { fa: 'انصراف', de: 'Abbrechen' },
  delete_confirm: { fa: 'حذف برای همیشه', de: 'Endgültig löschen' },
  deleting: { fa: 'در حال حذف...', de: 'Wird gelöscht...' },
  deleted_ok: { fa: 'مورد حذف شد.', de: 'Eintrag wurde gelöscht.' },
  delete_failed: { fa: 'حذف ناموفق بود. مورد حذف نشد. لطفاً دوباره تلاش کنید.', de: 'Löschen fehlgeschlagen. Der Eintrag wurde nicht gelöscht. Bitte erneut versuchen.' },
  delete_not_found: { fa: 'این مورد دیگر وجود ندارد (احتمالاً قبلاً حذف شده است). فهرست به‌روز شد.', de: 'Dieser Eintrag existiert nicht mehr (vermutlich bereits gelöscht). Die Liste wurde aktualisiert.' },

  // Dashboard
  dash_title: { fa: 'پنل مدیریت — دیدار', de: 'Verwaltung — Didar' },
  dash_heading: { fa: 'پنل مدیریت', de: 'Verwaltung' },
  dash_logout: { fa: 'خروج', de: 'Abmelden' },
  dash_stat_events: { fa: 'رویدادهای آینده', de: 'Kommende Veranstaltungen' },
  dash_stat_regs: { fa: 'ثبت‌نام جدید این هفته', de: 'Neue Anmeldungen diese Woche' },
  dash_stat_members: { fa: 'درخواست عضویت جدید', de: 'Neue Mitgliedsanträge' },
  dash_events: { fa: 'رویدادها', de: 'Veranstaltungen' },
  dash_events_desc: { fa: 'ایجاد و ویرایش رویدادها', de: 'Veranstaltungen erstellen und bearbeiten' },
  dash_regs: { fa: 'ثبت‌نام‌ها', de: 'Anmeldungen' },
  dash_regs_desc: { fa: 'مدیریت ثبت‌نام‌های رویدادها', de: 'Veranstaltungsanmeldungen verwalten' },
  dash_members: { fa: 'عضویت', de: 'Mitgliedschaft' },
  dash_members_desc: { fa: 'مدیریت درخواست‌های عضویت', de: 'Mitgliedsanträge verwalten' },
  dash_contact: { fa: 'پیام‌های تماس', de: 'Kontaktnachrichten' },
  dash_contact_desc: { fa: 'مشاهده و حذف پیام‌های فرم تماس', de: 'Nachrichten des Kontaktformulars ansehen und löschen' },
  dash_content: { fa: 'محتوا', de: 'Inhalte' },
  dash_content_desc: { fa: 'ویرایش متن‌های صفحات', de: 'Seitentexte bearbeiten' },
  dash_settings: { fa: 'تنظیمات', de: 'Einstellungen' },
  dash_settings_desc: { fa: 'اطلاعات تماس و شبکه‌های اجتماعی', de: 'Kontaktdaten und soziale Netzwerke' },
};

export function getAdminLang(router) {
  return router && router.locale === 'de' ? 'de' : 'fa';
}

export function adminDir(lang) {
  return lang === 'de' ? 'ltr' : 'rtl';
}

export function adminT(lang, key) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry.fa;
}

export function adminDate(value, lang) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return lang === 'de'
    ? date.toLocaleDateString('de-DE')
    : date.toLocaleDateString('fa-IR', { calendar: 'gregory' });
}
