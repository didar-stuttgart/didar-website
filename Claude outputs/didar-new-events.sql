-- DIDAR — 4 new events
-- Paste this whole file into Supabase's SQL Editor and click "Run".

INSERT INTO events (
  slug, title_fa, title_de, description_fa, description_de,
  event_date, event_time, location_fa, location_de,
  status, registration_open, image_url
) VALUES
(
  'book-club',
  'باشگاه کتاب‌خوانی دیدار',
  'DIDAR Lesekreis',
  'هر یکشنبه از ساعت ۱۹ تا ۲۱، در باشگاه کتاب‌خوانی دیدار دور هم جمع می‌شویم تا درباره‌ی یک کتاب فارسی یا ترجمه‌شده گفت‌وگو کنیم. فضایی صمیمی و بدون داوری برای کتاب‌دوستان جامعه‌ی ایرانی اشتوتگارت، جایی برای به اشتراک گذاشتن برداشت‌ها، آشنایی با آدم‌های تازه و تجربه‌ی مشترک لذت خواندن. شرکت برای همه‌ی علاقه‌مندان آزاد است و نیازی نیست کتاب را از قبل تمام کرده باشید.',
  'Jeden Sonntag von 19 bis 21 Uhr treffen wir uns beim DIDAR-Lesekreis, um über ein persisches oder übersetztes Buch zu sprechen. Ein offener, urteilsfreier Rahmen für Buchliebhaber:innen der iranischen Gemeinschaft in Stuttgart – zum Austausch von Eindrücken, Kennenlernen neuer Menschen und gemeinsamer Freude am Lesen. Die Teilnahme steht allen Interessierten offen; man muss das Buch nicht vorher fertig gelesen haben.',
  '2026-09-20', '19:00', NULL, NULL,
  'published', true, NULL
),
(
  'movie-night',
  'شب فیلم دیدار',
  'DIDAR Filmabend',
  'هر دو هفته یک‌بار دور هم جمع می‌شویم تا یک فیلم ایرانی یا بین‌المللی را با هم تماشا کنیم و بعد از آن درباره‌اش گفت‌وگو کنیم. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.',
  'Alle zwei Wochen schauen wir gemeinsam einen iranischen oder internationalen Film und sprechen anschließend darüber. Genaue Termine und weitere Details folgen in Kürze.',
  '2026-10-11', NULL, NULL, NULL,
  'published', false, NULL
),
(
  'critical-thinking-workshop',
  'ورکشاپ تفکر نقاد',
  'Workshop: Kritisches Denken',
  'ورکشاپی برای تمرین و تقویت تفکر نقادانه؛ از طریق بحث گروهی، بررسی نمونه‌های واقعی و تمرین‌های عملی. مناسب برای هر کسی که می‌خواهد در تحلیل موضوعات روزمره و رسانه‌ای دقیق‌تر و مستقل‌تر فکر کند. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.',
  'Ein Workshop zum Üben und Stärken kritischen Denkens – durch Gruppendiskussionen, die Analyse realer Beispiele und praktische Übungen. Geeignet für alle, die Themen des Alltags und der Medien unabhängiger und genauer hinterfragen möchten. Genaue Termine und weitere Details folgen in Kürze.',
  '2026-10-18', NULL, NULL, NULL,
  'published', false, NULL
),
(
  'psychology-workshop',
  'کارگاه روان‌شناسی',
  'Psychologie-Workshop',
  'کارگاهی با محوریت موضوعات روان‌شناسی روزمره، برای شناخت بهتر خود و دیگران و یادگیری ابزارهای ساده برای مواجهه با استرس، ارتباطات و چالش‌های فردی. فضایی گرم، محرمانه و بدون قضاوت. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.',
  'Ein Workshop rund um Themen der Alltagspsychologie – für ein besseres Verständnis von sich selbst und anderen sowie einfache Werkzeuge im Umgang mit Stress, Beziehungen und persönlichen Herausforderungen. Ein warmer, vertraulicher und urteilsfreier Rahmen. Genaue Termine und weitere Details folgen in Kürze.',
  '2026-10-25', NULL, NULL, NULL,
  'published', false, NULL
)
ON CONFLICT (slug) DO UPDATE SET
  title_fa = EXCLUDED.title_fa,
  title_de = EXCLUDED.title_de,
  description_fa = EXCLUDED.description_fa,
  description_de = EXCLUDED.description_de,
  event_date = EXCLUDED.event_date,
  event_time = EXCLUDED.event_time,
  status = EXCLUDED.status,
  registration_open = EXCLUDED.registration_open;
