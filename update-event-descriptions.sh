#!/bin/bash

# Update DIDAR event descriptions (Book Club and Film Night)
# Run this from the didar-website folder with environment variables configured

cd "$(dirname "$0")"

# Ensure we have Supabase credentials
if [ -z "$SUPABASE_SECRET_KEY" ]; then
  echo "Error: SUPABASE_SECRET_KEY environment variable not set"
  echo "Set it from your .env.local file and try again"
  exit 1
fi

SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
if [ -z "$SUPABASE_URL" ]; then
  SUPABASE_URL="https://pvvjkypwsbcjiqogrmta.supabase.co"
fi

echo "Updating DIDAR event descriptions..."
echo "Supabase URL: $SUPABASE_URL"
echo ""

# Book Club Description
BOOK_DESC='«همواره فرهنگ کتاب‌خوانی در گستره‌ی جوامع، امری‌ست که به ممارست و تمرین نیاز دارد. گاه اما، این امر فرهنگی در بستر یک حرکت جمعی، می‌تواند معنا و مفهومی تازه بیافریند.

در جلسات کتاب‌خوانی، تلاش می‌کنیم هر هفته گرد هم بیاییم و درباره‌ی یک کتاب، خواه ترجمه‌ای به فارسی و خواه اثری نوشته‌شده به این زبان، گفت‌وگو کنیم.

در این جلسات، میزبان جامعه‌ی فارسی‌زبان هستیم تا ساعتی را در کنار یکدیگر به گفت‌وگو درباره‌ی فرهنگ و ادبیات بگذرانیم؛ به کتاب‌ها نزدیک شویم، با یکدیگر گفت‌وگو کنیم و از خلال آن‌ها، به تجربه‌ها و اندیشه‌های تازه برسیم.»'

# Film Night Description
FILM_DESC='«سینما می‌تواند بهانه‌ای باشد برای دور هم جمع شدن، دیدن و گفت‌وگو کردن. در شب‌های فیلم، گرد هم می‌آییم تا به تماشای یک فیلم از سینمای ایران و جهان بنشینیم و پس از آن درباره‌ی آنچه دیده‌ایم، با یکدیگر گفت‌وگو کنیم.

گاهی نیز در کنار ما، منتقد یا مهمان ویژه‌ای حضور خواهد داشت تا از زاویه‌ای تازه به فیلم نگاه کنیم و گفت‌وگویی عمیق‌تر داشته باشیم.»'

# Update via local Node.js with Supabase SDK
npm install --silent 2>/dev/null || echo "(Dependencies already installed)"

cat > /tmp/update_events_temp.js << 'NODEJS_EOF'
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://pvvjkypwsbcjiqogrmta.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseSecretKey) {
  console.error('Error: SUPABASE_SECRET_KEY not set');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const bookClubDesc = `«همواره فرهنگ کتاب‌خوانی در گستره‌ی جوامع، امری‌ست که به ممارست و تمرین نیاز دارد. گاه اما، این امر فرهنگی در بستر یک حرکت جمعی، می‌تواند معنا و مفهومی تازه بیافریند.

در جلسات کتاب‌خوانی، تلاش می‌کنیم هر هفته گرد هم بیاییم و درباره‌ی یک کتاب، خواه ترجمه‌ای به فارسی و خواه اثری نوشته‌شده به این زبان، گفت‌وگو کنیم.

در این جلسات، میزبان جامعه‌ی فارسی‌زبان هستیم تا ساعتی را در کنار یکدیگر به گفت‌وگو درباره‌ی فرهنگ و ادبیات بگذرانیم؛ به کتاب‌ها نزدیک شویم، با یکدیگر گفت‌وگو کنیم و از خلال آن‌ها، به تجربه‌ها و اندیشه‌های تازه برسیم.»`;

const filmNightDesc = `«سینما می‌تواند بهانه‌ای باشد برای دور هم جمع شدن، دیدن و گفت‌وگو کردن. در شب‌های فیلم، گرد هم می‌آییم تا به تماشای یک فیلم از سینمای ایران و جهان بنشینیم و پس از آن درباره‌ی آنچه دیده‌ایم، با یکدیگر گفت‌وگو کنیم.

گاهی نیز در کنار ما، منتقد یا مهمان ویژه‌ای حضور خواهد داشت تا از زاویه‌ای تازه به فیلم نگاه کنیم و گفت‌وگویی عمیق‌تر داشته باشیم.»`;

async function updateEvents() {
  try {
    // Update Book Club
    const { data: bookClub, error: bookError } = await adminClient
      .from('events')
      .update({ description_fa: bookClubDesc })
      .eq('slug', 'book-club')
      .select();

    if (bookError) {
      console.error('❌ Error updating Book Club:', bookError.message);
    } else {
      console.log('✅ Book Club updated:', bookClub[0]?.id);
    }

    // Update Film Night
    const { data: filmNight, error: filmError } = await adminClient
      .from('events')
      .update({ description_fa: filmNightDesc })
      .eq('slug', 'film-night')
      .select();

    if (filmError) {
      console.error('❌ Error updating Film Night:', filmError.message);
    } else {
      console.log('✅ Film Night updated:', filmNight[0]?.id);
    }

    if (!bookError && !filmError) {
      console.log('\n✅ All event descriptions updated successfully');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateEvents();
NODEJS_EOF

node /tmp/update_events_temp.js
EXIT_CODE=$?

rm -f /tmp/update_events_temp.js

exit $EXIT_CODE
