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

console.log('Querying Supabase cms_content table...\n');

const { data: cmsContent, error } = await supabase
  .from('cms_content')
  .select('*')
  .ilike('section', '%about%');

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

console.log('Records found:', cmsContent.length, '\n');

cmsContent.forEach((row, idx) => {
  console.log('Record ' + idx + ':');
  console.log('  Key: ' + row.key);
  console.log('  Section: ' + row.section);
  console.log('  Content FA (Persian):');
  console.log('    Raw: ' + JSON.stringify(row.content_fa));
  console.log('    Display: ' + row.content_fa);
  console.log('  Content DE (German):');
  console.log('    Raw: ' + JSON.stringify(row.content_de));
  console.log('    Display: ' + row.content_de);
  console.log('');
});
