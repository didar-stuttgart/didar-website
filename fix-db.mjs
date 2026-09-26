import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    envVars[match[1]] = match[2];
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = envVars.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

console.log('Replacing corrupted test data with properly encoded Persian text...\n');

// Fix homepage.about_card.title
const { error: err1 } = await supabase
  .from('cms_content')
  .update({
    content_fa: '[TEST] این یک عنوان آزمایشی است.',
    content_de: '[TEST] Dies ist ein Testtitel.'
  })
  .eq('key', 'homepage.about_card.title');

if (err1) {
  console.error('Error updating title:', err1.message);
} else {
  console.log('✅ Updated homepage.about_card.title');
}

// Fix homepage.about_card.description
const { error: err2 } = await supabase
  .from('cms_content')
  .update({
    content_fa: '[TEST] این یک متن توصیفی آزمایشی درباره دیدار است.',
    content_de: '[TEST] Dies ist ein beschreibender Testtext über Didar.'
  })
  .eq('key', 'homepage.about_card.description');

if (err2) {
  console.error('Error updating description:', err2.message);
} else {
  console.log('✅ Updated homepage.about_card.description');
}

console.log('\nVerifying updated data...\n');

const { data: updated } = await supabase
  .from('cms_content')
  .select('*')
  .ilike('section', '%about%');

updated.forEach((row, idx) => {
  console.log('Record ' + idx + ':');
  console.log('  Key: ' + row.key);
  console.log('  Persian: ' + row.content_fa);
  console.log('  German: ' + row.content_de);
  console.log('');
});

console.log('✅ Persian test data fixed with proper UTF-8 encoding');
