import { validateSession } from '../../../../lib/admin-auth.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  const sessionToken = req.cookies?.admin_session;
  if (!sessionToken || !validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetEvents(req, res);
  } else if (req.method === 'POST') {
    return handleCreateEvent(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetEvents(req, res) {
  try {
    const adminClient = createAdminClient();
    const { data: events, error } = await adminClient
      .from('events')
      .select('*')
      .order('event_date', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ events: events || [] });
  } catch (err) {
    console.error('Get events error:', err);
    return res.status(500).json({ error: 'Failed to load events' });
  }
}

async function handleCreateEvent(req, res) {
  try {
    const { event } = req.body;
    if (!event.title_fa || !event.title_de || !event.event_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const adminClient = createAdminClient();
    const slug = event.title_fa.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await adminClient
      .from('events')
      .insert([
        {
          slug,
          title_fa: event.title_fa,
          title_de: event.title_de,
          description_fa: event.description_fa || '',
          description_de: event.description_de || '',
          event_date: event.event_date,
          event_time: event.event_time || null,
          location_fa: event.location_fa || '',
          location_de: event.location_de || '',
          image_url: event.image_url || '',
          status: event.status || 'draft',
          registration_open: event.registration_open || false,
        },
      ])
      .select();

    if (error) throw error;
    return res.status(200).json({ event: data[0] });
  } catch (err) {
    console.error('Create event error:', err);
    return res.status(500).json({ error: 'Failed to create event' });
  }
}
