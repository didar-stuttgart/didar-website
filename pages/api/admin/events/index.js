import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
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

    // Validate required fields
    if (!event.title_fa || !event.title_de) {
      return res.status(400).json({ error: 'Title in both languages is required' });
    }

    // Date validation: required for dated events, optional for recurring events
    if (!event.is_recurring && !event.event_date) {
      return res.status(400).json({ error: 'Event date is required for dated events' });
    }

    // Validate capacity: must be empty or a positive integer
    if (event.capacity !== null && event.capacity !== undefined && event.capacity !== '') {
      const cap = Number(event.capacity);
      if (!Number.isInteger(cap) || cap < 1) {
        return res.status(400).json({
          error: 'Capacity must be empty or a positive integer (1 or higher)'
        });
      }
      event.capacity = cap;
    } else {
      event.capacity = null;
    }

    // Validate remaining_capacity: purely a manually-set public display
    // value ("ظرفیت باقیمانده" / "Verbleibende Plätze"). Must be empty or a
    // non-negative integer. Never derived/calculated from registrations.
    if (
      event.remaining_capacity !== null &&
      event.remaining_capacity !== undefined &&
      event.remaining_capacity !== ''
    ) {
      const remaining = Number(event.remaining_capacity);
      if (!Number.isInteger(remaining) || remaining < 0) {
        return res.status(400).json({
          error: 'Remaining capacity must be empty or a non-negative integer (0 or higher)'
        });
      }
      event.remaining_capacity = remaining;
    } else {
      event.remaining_capacity = null;
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
          event_date: event.event_date || null,
          event_time: event.event_time || null,
          location_fa: event.location_fa || '',
          location_de: event.location_de || '',
          capacity: event.capacity,
          remaining_capacity: event.remaining_capacity,
          registration_deadline: event.registration_deadline || null,
          image_url: event.image_url || '',
          status: event.status || 'draft',
          registration_status: event.registration_status || (event.status === 'published' ? 'open' : 'not_open'),
          admin_notes: event.admin_notes || '',
          is_recurring: event.is_recurring || false,
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

