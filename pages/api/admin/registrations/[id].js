import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';
import { deleteRecordById } from '../../../../lib/admin-records.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    const result = await deleteRecordById(createAdminClient(), 'registrations', id);
    return res.status(result.status).json(result.body);
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status, admin_notes } = req.body;
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('event_registrations')
      .update({ status, admin_notes })
      .eq('id', id)
      .select();

    if (error) throw error;
    // Never return the cancellation token hash to the browser
    const registration = { ...data[0] };
    delete registration.cancellation_token_hash;
    return res.status(200).json({ registration });
  } catch (err) {
    // Re-activating a cancelled registration while another active one exists
    // for the same event and email violates the partial unique index (migration 013)
    if (err?.code === '23505') {
      return res.status(409).json({ error: 'An active registration for this event and email already exists' });
    }
    console.error('Update registration error:', err);
    return res.status(500).json({ error: 'Failed to update registration' });
  }
}
