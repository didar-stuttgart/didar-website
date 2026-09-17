const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Minimal .env.local parser (no dotenv dependency needed)
const envPath = path.join(__dirname, '..', '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach((line) => {
  const match = line.match(/^([A-Z_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  console.error('Missing Supabase URL or secret key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const events = [
  {
    slug: 'book-club',
    title_fa: 'باشگاه کتاب‌خوانی دیدار',
    title_de: 'DIDAR Lesekreis',
    description_fa: 'هر یکشنبه از ساعت ۱۹ تا ۲۱، در باشگاه کتاب‌خوانی دیدار دور هم جمع می‌شویم تا درباره‌ی یک کتاب فارسی یا ترجمه‌شده گفت‌وگو کنیم. فضایی صمیمی و بدون داوری برای کتاب‌دوستان جامعه‌ی ایرانی اشتوتگارت، جایی برای به اشتراک گذاشتن برداشت‌ها، آشنایی با آدم‌های تازه و تجربه‌ی مشترک لذت خواندن. شرکت برای همه‌ی علاقه‌مندان آزاد است و نیازی نیست کتاب را از قبل تمام کرده باشید.',
    description_de: 'Jeden Sonntag von 19 bis 21 Uhr treffen wir uns beim DIDAR-Lesekreis, um über ein persisches oder übersetztes Buch zu sprechen. Ein offener, urteilsfreier Rahmen für Buchliebhaber:innen der iranischen Gemeinschaft in Stuttgart – zum Austausch von Eindrücken, Kennenlernen neuer Menschen und gemeinsamer Freude am Lesen. Die Teilnahme steht allen Interessierten offen; man muss das Buch nicht vorher fertig gelesen haben.',
    event_date: '2026-09-20',
    event_time: '19:00',
    location_fa: null,
    location_de: null,
    status: 'published',
    registration_open: true,
    image_url: null,
  },
  {
    slug: 'movie-night',
    title_fa: 'شب فیلم دیدار',
    title_de: 'DIDAR Filmabend',
    description_fa: 'هر دو هفته یک‌بار دور هم جمع می‌شویم تا یک فیلم ایرانی یا بین‌المللی را با هم تماشا کنیم و بعد از آن درباره‌اش گفت‌وگو کنیم. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.',
    description_de: 'Alle zwei Wochen schauen wir gemeinsam einen iranischen oder internationalen Film und sprechen anschließend darüber. Genaue Termine und weitere Details folgen in Kürze.',
    event_date: '2026-10-11',
    event_time: null,
    location_fa: null,
    location_de: null,
    status: 'published',
    registration_open: false,
    image_url: null,
  },
  {
    slug: 'critical-thinking-workshop',
    title_fa: 'ورکشاپ تفکر نقاد',
    title_de: 'Workshop: Kritisches Denken',
    description_fa: 'ورکشاپی برای تمرین و تقویت تفکر نقادانه؛ از طریق بحث گروهی، بررسی نمونه‌های واقعی و تمرین‌های عملی. مناسب برای هر کسی که می‌خواهد در تحلیل موضوعات روزمره و رسانه‌ای دقیق‌تر و مستقل‌تر فکر کند. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.',
    description_de: 'Ein Workshop zum Üben und Stärken kritischen Denkens – durch Gruppendiskussionen, die Analyse realer Beispiele und praktische Übungen. Geeignet für alle, die Themen des Alltags und der Medien unabhängiger und genauer hinterfragen möchten. Genaue Termine und weitere Details folgen in Kürze.',
    event_date: '2026-10-18',
    event_time: null,
    location_fa: null,
    location_de: null,
    status: 'published',
    registration_open: false,
    image_url: null,
  },
  {
    slug: 'psychology-workshop',
    title_fa: 'کارگاه روان‌شناسی',
    title_de: 'Psychologie-Workshop',
    description_fa: 'کارگاهی با محوریت موضوعات روان‌شناسی روزمره، برای شناخت بهتر خود و دیگران و یادگیری ابزارهای ساده برای مواجهه با استرس، ارتباطات و چالش‌های فردی. فضایی گرم، محرمانه و بدون قضاوت. جزئیات کامل و تاریخ دقیق برگزاری به‌زودی اعلام می‌شود.',
    description_de: 'Ein Workshop rund um Themen der Alltagspsychologie – für ein besseres Verständnis von sich selbst und anderen sowie einfache Werkzeuge im Umgang mit Stress, Beziehungen und persönlichen Herausforderungen. Ein warmer, vertraulicher und urteilsfreier Rahmen. Genaue Termine und weitere Details folgen in Kürze.',
    event_date: '2026-10-25',
    event_time: null,
    location_fa: null,
    location_de: null,
    status: 'published',
    registration_open: false,
    image_url: null,
  },
];

(async () => {
  const { data, error } = await supabase.from('events').upsert(events, { onConflict: 'slug' }).select();
  if (error) {
    console.error('INSERT ERROR:', error);
    process.exit(1);
  }
  console.log('Inserted/updated', data.length, 'events:');
  data.forEach((e) => console.log(' -', e.slug, e.id, e.event_date, e.status, 'reg_open=' + e.registration_open));
})();
