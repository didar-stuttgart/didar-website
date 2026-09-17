import { requireAdminSession } from '../../../lib/api-middleware.js';
import { createAdminClient } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminClient = createAdminClient();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: events } = await adminClient
      .from('events')
      .select('slug')
      .eq('status', 'published')
      .gte('event_date', today.toISOString().split('T')[0]);

    const { data: registrations } = await adminClient
      .from('registrations')
      .select('id')
      .gte('registration_date', weekAgo.toISOString());

    const { data: memberships } = await adminClient
      .from('memberships')
      .select('id')
      .gte('created_at', weekAgo.toISOString());

    return res.status(200).json({
      upcomingEvents: events?.length || 0,
      newRegistrations: registrations?.length || 0,
      newMemberships: memberships?.length || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}
