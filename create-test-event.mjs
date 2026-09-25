import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvvjkypwsbcjiqogrmta.supabase.co';
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SECRET_KEY;

async function createTestEvent() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
  
  const testEvent = {
    title_de: 'E2E Capacity Test 25 Sep 2026 — Temporary',
    title_fa: 'تست ظرفیت E2E 25 سپتامبر 2026 — موقت',
    description_de: 'Temporary test event for capacity enforcement acceptance testing. Delete after testing.',
    description_fa: 'رویداد تست موقت برای تست پذیرش اعمال ظرفیت. پس از تست حذف کنید.',
    status: 'published',
    registration_status: 'open',
    capacity: 2,
    registration_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location_de: 'Stuttgart',
    location_fa: 'شتوتگارت',
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([testEvent])
      .select();
    
    if (error) {
      console.error('Error creating test event:', error);
      process.exit(1);
    }
    
    console.log('✅ Test event created successfully');
    console.log('Event ID:', data[0].id);
    console.log('Title (DE):', data[0].title_de);
    console.log('Capacity:', data[0].capacity);
    console.log('Registration Status:', data[0].registration_status);
    console.log('Event Date:', data[0].event_date);
    process.exit(0);
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

createTestEvent();
