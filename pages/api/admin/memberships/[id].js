import { validateSession } from '../../../../lib/admin-auth.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  const sessionToken = req.cookies?.admin_session;
  if (!sessionToken || !validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, admin_notes } = req.body;
    const adminClient = createAdminClient();

    const updateData = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const { data, error } = await adminClient
      .from('memberships')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.status(200).json({ membership: data[0] });
  } catch (err) {
    console.error('Update membership error:', err);
    return res.status(500).json({ error: 'Failed to update membership' });
  }
}
