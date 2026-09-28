/**
 * Event registration submission endpoint — MANUAL MODEL
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 * Server-side validation required
 * 
 * Manual registration flow:
 * - User fills out and submits form
 * - Registration saved immediately with status='new' via SECURITY DEFINER RPC
 * - No verification email sent
 * - No verification token generated
 * - User sees confirmation message that request will be reviewed manually
 * - Admin receives notification email with all submitted details
 * - Admin reviews in admin panel and manually contacts participant
 */

import { createServerClient } from '@/lib/supabase';
import { validateEventRegistration } from '@/lib/validation';
import { withRateLimit } from '@/lib/middleware';
import { sendRegistrationNotification } from '@/lib/admin-email';

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
      return res.status(409).json({
        error: 'Registration is not open for this event',
        errorType: 'registration_closed',
      });
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

    // Call SECURITY DEFINER RPC to insert registration with status='new'
    // This bypasses RLS while maintaining security
    const { data: registrationId, error: insertError } = await supabase
      .rpc('insert_event_registration_manual', {
        event_id_param: eventId,
        first_name_param: firstName.trim(),
        last_name_param: lastName.trim(),
        email_param: email.trim().toLowerCase(),
        phone_param: phone?.trim() || null,
        telegram_id_param: telegramId?.trim() || null,
        comment_param: comment?.trim() || null,
      });

    if (insertError) {
      // Check if it's a duplicate email constraint
      if (insertError.message && insertError.message.includes('duplicate')) {
        return res.status(409).json({
          error: 'You have already registered for this event with this email',
          errorType: 'duplicate_email',
        });
      }

      console.error('Supabase RPC error:', insertError);
      return res.status(500).json({ error: 'Failed to submit registration' });
    }

    if (!registrationId) {
      console.error('RPC returned null registration ID');
      return res.status(500).json({ error: 'Failed to submit registration' });
    }

    // Send admin notification. This is awaited (rather than fire-and-forget)
    // because Vercel serverless functions can freeze/terminate execution as
    // soon as the HTTP response is sent — an un-awaited notification call
    // here can be killed mid-flight before its fetch() to Resend ever
    // completes. This endpoint previously appeared to "work" only because
    // this event page's capacity-status polling happens to keep the same
    // serverless container warm long enough for the pending call to finish;
    // Contact and Membership have no equivalent polling, so it was much
    // more consistently cut off there. sendRegistrationNotification()
    // catches its own errors internally and never throws, so awaiting it
    // cannot fail this request or roll back the database insert that
    // already succeeded above.
    const eventTitle = language === 'fa' ? event.title_fa : event.title_de;
    await sendRegistrationNotification({
      submissionId: registrationId,
      eventTitle,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      telegramId: telegramId?.trim() || null,
      comment: comment?.trim() || null,
      timestamp: new Date().toISOString(),
    });

    // Manual model success message - DIDAR will contact manually, not automatic confirmation
    return res.status(201).json({
      success: true,
      message: language === 'fa' 
        ? 'درخواست شما دریافت شد. در صورت نیاز، دیدار از طریق ایمیل با شما تماس خواهد گرفت.'
        : 'Ihre Anfrage wurde empfangen. DIDAR wird sich gegebenenfalls per E-Mail bei Ihnen melden.',
      registrationId,
    });
  } catch (error) {
    console.error('Registration submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
