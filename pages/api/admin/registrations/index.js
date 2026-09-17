import { validateSession } from '../../../../lib/admin-auth.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  const sessionToken = req.cookies?.admin_session;
  if (!sessionToken || !validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminClient = createAdminClient();
    const { data: registrations, error } = await adminClient
      .from('registrations')
      .select('*, event:event(title_fa, title_de)')
      .order('registration_date', { ascending: false });

    if (error) throw error;

    const formatted = registrations.map((reg) => ({
      ...reg,
      event_title: reg.event?.title_fa || reg.event?.title_de || reg.event,
    }));

    return res.status(200).json({ registrations: formatted });
  } catch (err) {
    console.error('Get registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
