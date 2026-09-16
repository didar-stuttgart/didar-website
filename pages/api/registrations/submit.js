/**
 * Event registration submission endpoint
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 * Server-side validation required
 */

import { createServerClient } from '@/lib/supabase';
import { validateEventRegistration } from '@/lib/validation';
import { withRateLimit } from '@/lib/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId, firstName, lastName, email, phone, telegramId, comment } = req.body;

    // Validate required fields
    if (!eventId || typeof eventId !== 'number') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Validate all fields
    const validation = validateEventRegistration({
      firstName,
      lastName,
      email,
      phone,
      telegramId,
      comment,
    });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Submit to Supabase
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('event_registrations')
      .insert([
        {
          event_id: eventId,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          telegram_id: telegramId?.trim() || null,
          comment: comment?.trim() || null,
          status: 'new',
        },
      ])
      .select('id');

    if (error) {
      // Handle duplicate email for this event
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'You have already registered for this event with this email',
        });
      }

      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to submit registration' });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration submitted successfully',
      id: data[0]?.id,
    });
  } catch (error) {
    console.error('Registration submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
