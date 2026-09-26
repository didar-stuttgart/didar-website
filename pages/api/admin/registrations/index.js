import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminClient = createAdminClient();
    const { data: registrations, error } = await adminClient
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Enrich with event titles. event_registrations only stores event_id,
    // so the readable title has to be looked up from the events table
    // (previously this read a nonexistent reg.event field and always fell
    // back to "Unknown Event").
    const eventIds = [...new Set((registrations || []).map((reg) => reg.event_id).filter((id) => id != null))];

    let eventsById = {};
    if (eventIds.length > 0) {
      const { data: events, error: eventsError } = await adminClient
        .from('events')
        .select('id, title_fa, title_de')
        .in('id', eventIds);

      if (eventsError) throw eventsError;

      eventsById = (events || []).reduce((acc, ev) => {
        acc[ev.id] = ev;
        return acc;
      }, {});
    }

    const enriched = (registrations || []).map((reg) => {
      const event = eventsById[reg.event_id];
      return {
        ...reg,
        event_title: event ? (event.title_fa || event.title_de) : 'Unknown Event',
      };
    });

    return res.status(200).json({ registrations: enriched });
  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}

