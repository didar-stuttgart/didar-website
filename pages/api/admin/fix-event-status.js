/**
 * Emergency fix endpoint - updates registration_status to 'open' for e2e-capacity-test event
 * Only accessible to authenticated admins
 */

import { requireAdminSession } from '../../../lib/api-middleware.js';
import { createAdminClient } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Require admin authentication
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const adminClient = createAdminClient();

    // Find the event by slug
    const { data: event, error: findError } = await adminClient
      .from('events')
      .select('id, slug, registration_status')
      .eq('slug', 'e2e-capacity-test-temp-2026-09-25')
      .single();

    if (findError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Found event:', event);

    // Update registration_status to 'open'
    const { data: updated, error: updateError } = await adminClient
      .from('events')
      .update({ registration_status: 'open' })
      .eq('id', event.id)
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to update event', details: updateError });
    }

    return res.status(200).json({
      success: true,
      message: 'Event registration_status updated to "open"',
      event: updated[0],
      note: 'ISR cache reduced to 60 seconds. Page will regenerate on next request.'
    });
  } catch (err) {
    console.error('Error in fix-event-status:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
