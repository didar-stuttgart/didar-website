/**
 * Event registration self-cancellation endpoint
 * Public endpoint - authorization is the secret token from the receipt email.
 *
 * POST only. A GET never changes anything (email scanners and link-preview
 * bots open links automatically); the cancellation page only shows a
 * confirmation button, and that button sends this POST.
 *
 * Flow:
 *   POST { token }
 *   -> validate token shape -> SHA-256 hash -> narrow SECURITY DEFINER RPC
 *      cancel_event_registration_manual(token_hash) -> status 'cancelled'
 *   -> admin notification only when the state actually changed now
 *
 * The registration is never deleted. The raw token is never stored or logged.
 * Capacity, event status and registration_status are not touched.
 */

import { createServerClient } from '@/lib/supabase';
import { withRateLimit } from '@/lib/middleware';
import { sendRegistrationCancellationNotification } from '@/lib/admin-email';
import {
  hashCancellationToken,
  isWellFormedCancellationToken,
} from '@/lib/registration-cancellation';

async function getEventTitle(supabase, eventId) {
  try {
    const { data } = await supabase
      .from('events')
      .select('title_fa, title_de')
      .eq('id', eventId)
      .maybeSingle();

    if (data) {
      const titles = [data.title_de, data.title_fa].filter(Boolean);
      const unique = [...new Set(titles)];
      if (unique.length > 0) return unique.join(' / ');
    }
  } catch {
    // Title is only used for the admin email; fall through to the fallback
  }
  return `Event #${eventId}`;
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.body?.token;

    if (token === undefined || token === null || token === '') {
      return res.status(400).json({ error: 'Token is required', status: 'missing_token' });
    }

    // Malformed tokens cannot match anything; answer like an unknown token
    if (!isWellFormedCancellationToken(token)) {
      return res.status(404).json({ status: 'invalid' });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase.rpc('cancel_event_registration_manual', {
      token_hash_param: hashCancellationToken(token),
    });

    if (error) {
      console.error('Registration cancellation RPC error:', {
        code: error.code,
        message: error.message,
      });
      return res.status(500).json({ error: 'Failed to cancel registration' });
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row || row.out_outcome === 'invalid') {
      return res.status(404).json({ status: 'invalid' });
    }

    if (row.out_outcome === 'already_cancelled') {
      // Nothing changed, so no admin notification (no duplicates)
      return res.status(200).json({ status: 'already_cancelled' });
    }

    if (row.out_outcome !== 'cancelled') {
      console.error('Registration cancellation RPC returned an unexpected outcome');
      return res.status(500).json({ error: 'Failed to cancel registration' });
    }

    // The registration is now cancelled. Notify the admin (awaited for the
    // same serverless reason as the other notifications). The notification
    // function never throws and cannot undo the cancellation.
    try {
      const eventTitle = await getEventTitle(supabase, row.out_event_id);
      await sendRegistrationCancellationNotification({
        registrationId: row.out_registration_id,
        eventTitle,
        firstName: row.out_first_name,
        lastName: row.out_last_name,
        email: row.out_email,
        previousStatus: row.out_previous_status,
        cancelledAt: String(row.out_cancelled_at || new Date().toISOString()),
      });
    } catch (notifyError) {
      // The cancellation itself already succeeded; never fail the request
      console.error('Registration cancellation notification error:', notifyError.message);
    }

    return res.status(200).json({ status: 'cancelled' });
  } catch (error) {
    console.error('Registration cancellation error:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting (same limiter as the other public form endpoints)
export default withRateLimit(handler);
