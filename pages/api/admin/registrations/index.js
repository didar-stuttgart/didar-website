import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';
import { parseRecordId } from '../../../../lib/admin-records.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional server-side filter: ?eventId=<events.id>. Absent or empty = all events.
  const rawEventId = Array.isArray(req.query.eventId) ? req.query.eventId[0] : req.query.eventId;
  let eventId = null;
  if (rawEventId !== undefined && rawEventId !== '') {
    eventId = parseRecordId(rawEventId);
    if (!eventId) {
      return res.status(400).json({ error: 'Invalid event id' });
    }
  }

  try {
    const adminClient = createAdminClient();
    let query = adminClient
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    const { data: registrations, error } = await query;

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
      // The cancellation token hash is a credential-derived value; the admin UI never needs it
      // eslint-disable-next-line no-unused-vars
      const { cancellation_token_hash, ...regWithoutTokenHash } = reg;
      return {
        ...regWithoutTokenHash,
        event_title: event ? (event.title_fa || event.title_de) : 'Unknown Event',
        event_title_de: event ? (event.title_de || event.title_fa) : 'Unknown Event',
      };
    });

    return res.status(200).json({ registrations: enriched });
  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
