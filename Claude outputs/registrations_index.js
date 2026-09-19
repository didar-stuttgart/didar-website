import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!requireAdminSession(req, res)) {
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

    // Enrich with event titles
    const enriched = registrations?.map((reg) => ({
      ...reg,
      event_title: reg.event || 'Unknown Event',
    })) || [];

    return res.status(200).json({ registrations: enriched });
  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
