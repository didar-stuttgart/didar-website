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
    const { data: memberships, error } = await adminClient
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ memberships: memberships || [] });
  } catch (err) {
    console.error('Get memberships error:', err);
    return res.status(500).json({ error: 'Failed to load memberships' });
  }
}
