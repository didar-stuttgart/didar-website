import { validateSession } from '../../../../lib/admin-auth.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  const sessionToken = req.cookies?.admin_session;
  if (!sessionToken || !validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;

  if (req.method === 'GET') {
    return handleGetEvent(req, res, slug);
  } else if (req.method === 'PATCH') {
    return handleUpdateEvent(req, res, slug);
  } else if (req.method === 'DELETE') {
    return handleDeleteEvent(req, res, slug);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetEvent(req, res, slug) {
  try {
    const adminClient = createAdminClient();
    const { data: event, error } = await adminClient
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    if (!event) return res.status(404).json({ error: 'Event not found' });
    return res.status(200).json({ event });
  } catch (err) {
    console.error('Get event error:', err);
    return res.status(500).json({ error: 'Failed to load event' });
  }
}

async function handleUpdateEvent(req, res, slug) {
  try {
    const { event } = req.body;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('events')
      .update({
        title_fa: event.title_fa,
        title_de: event.title_de,
        description_fa: event.description_fa,
        description_de: event.description_de,
        event_date: event.event_date,
        event_time: event.event_time,
        location_fa: event.location_fa,
        location_de: event.location_de,
        image_url: event.image_url,
        status: event.status,
        registration_open: event.registration_open,
      })
      .eq('slug', slug)
      .select();

    if (error) throw error;
    return res.status(200).json({ event: data[0] });
  } catch (err) {
    console.error('Update event error:', err);
    return res.status(500).json({ error: 'Failed to update event' });
  }
}

async function handleDeleteEvent(req, res, slug) {
  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient
      .from('events')
      .delete()
      .eq('slug', slug);

    if (error) throw error;
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete event error:', err);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
}
