import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, admin_notes } = req.body;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('membership_applications')
      .update({ status, admin_notes })
      .eq('id', id)
      .select();

    if (error) throw error;
    return res.status(200).json({ membership: data[0] });
  } catch (err) {
    console.error('Update membership error:', err);
    return res.status(500).json({ error: 'Failed to update membership' });
  }
}
