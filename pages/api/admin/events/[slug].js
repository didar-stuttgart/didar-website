import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { slug } = req.query;

  if (req.method === 'GET') {
    return handleGetEvent(slug, req, res);
  } else if (req.method === 'PATCH') {
    return handleUpdateEvent(slug, req, res);
  } else if (req.method === 'DELETE') {
    return handleDeleteEvent(slug, req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetEvent(slug, req, res) {
  try {
    const adminClient = createAdminClient();
    const { data: event, error } = await adminClient
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    return res.status(200).json({ event });
  } catch (err) {
    console.error('Get event error:', err);
    return res.status(500).json({ error: 'Failed to load event' });
  }
}

async function handleUpdateEvent(slug, req, res) {
  try {
    const { event } = req.body;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('events')
      .update({
        title_fa: event.title_fa,
        title_de: event.title_de,
        description_fa: event.description_fa || '',
        description_de: event.description_de || '',
        event_date: event.event_date,
        event_time: event.event_time || null,
        location_fa: event.location_fa || '',
        location_de: event.location_de || '',
        capacity: event.capacity || null,
        registration_deadline: event.registration_deadline || null,
        image_url: event.image_url || '',
        status: event.status || 'draft',
        registration_status: event.registration_status || 'not_open',
        admin_notes: event.admin_notes || '',
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

async function handleDeleteEvent(slug, req, res) {
  try {
    const adminClient = createAdminClient();
    // Archive instead of hard delete — soft delete by setting status to 'archived'
    const { data, error } = await adminClient
      .from('events')
      .update({ status: 'archived' })
      .eq('slug', slug)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, event: data[0] });
  } catch (err) {
    console.error('Archive event error:', err);
    return res.status(500).json({ error: 'Failed to archive event' });
  }
}
