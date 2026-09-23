/**
 * Event registration submission endpoint
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 * Server-side validation required
 * 
 * Modified for event registration verification:
 * - Creates registration with status='pending'
 * - Generates verification token
 * - Sends verification email
 */

import { createServerClient } from '@/lib/supabase';
import { validateEventRegistration } from '@/lib/validation';
import { withRateLimit } from '@/lib/middleware';
import { generateToken, hashToken, getTokenExpiration } from '@/lib/verification';
import { sendVerificationEmail } from '@/lib/email';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId, firstName, lastName, email, phone, telegramId, comment, language = 'de' } = req.body;

    // Validate required eventId
    if (!eventId || typeof eventId !== 'number') {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Verify event exists and is published with registration open
    const supabase = createServerClient();
    
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status, registration_status, title_fa, title_de')
      .eq('id', eventId)
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found or is not accepting registrations' });
    }

    if (event.registration_status !== 'open') {
      return res.status(400).json({ error: 'Registration is not open for this event' });
    }

    // Validate all form fields
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

    // Generate verification token
    const rawToken = generateToken();
    const tokenHash = hashToken(rawToken);
    const tokenExpiration = getTokenExpiration();

    // Submit registration to Supabase using RPC function
    // The insert_event_registration RPC function is a SECURITY DEFINER function
    // that safely inserts the registration and returns only the new ID
    const { data: registrationResult, error: insertError } = await supabase
      .rpc('insert_event_registration', {
        event_id_param: eventId,
        first_name_param: firstName.trim(),
        last_name_param: lastName.trim(),
        email_param: email.trim().toLowerCase(),
        phone_param: phone?.trim() || null,
        telegram_id_param: telegramId?.trim() || null,
        comment_param: comment?.trim() || null,
        verification_token_hash_param: tokenHash,
        verification_token_expires_at_param: tokenExpiration,
      });

    if (insertError) {
      // Handle duplicate email for this event
      if (insertError.code === '23505') {
        return res.status(409).json({
          error: 'You have already registered for this event with this email',
        });
      }

      console.error('Supabase RPC error:', insertError);
      return res.status(500).json({ error: 'Failed to submit registration' });
    }

    // Extract registration ID from RPC result
    const registration = {
      id: registrationResult?.[0]?.registration_id,
    };

    if (!registration.id) {
      console.error('RPC returned no registration ID');
      return res.status(500).json({ error: 'Failed to submit registration' });
    }

    // Send verification email
    try {
      const userName = `${firstName} ${lastName}`;
      await sendVerificationEmail(
        email.trim().toLowerCase(),
        userName,
        registration.id,
        rawToken,
        language
      );
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the registration if email fails
      // The user can request a resend if needed (future feature)
    }

    return res.status(201).json({
      success: true,
      message: 'Registration submitted. Please check your email to verify your registration.',
      registrationId: registration.id,
    });
  } catch (error) {
    console.error('Registration submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
