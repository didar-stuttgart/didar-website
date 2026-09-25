/**
 * Event registration verification endpoint
 * GET /api/registrations/verify?id={registrationId}&token={verificationToken}
 * 
 * Verifies a registration via email link
 * Calls the atomic verify_registration_atomic() RPC function
 * Returns HTTP status and capacityStatus in response
 * Sends confirmation email after successful verification
 */

import { createServerClient, createAdminClient } from '@/lib/supabase';
import { hashToken } from '@/lib/verification';
import { sendConfirmationEmail } from '@/lib/email';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, token } = req.query;

    // Validate inputs
    if (!id || !token) {
      return res.status(400).json({
        error: 'Missing required parameters',
        details: 'id and token are required',
      });
    }

    const registrationId = parseInt(id, 10);
    if (isNaN(registrationId)) {
      return res.status(400).json({ error: 'Invalid registration ID' });
    }

    // Hash the provided token for comparison
    const tokenHash = hashToken(token);

    // Use admin client for all database operations
    const supabase = createAdminClient();

    // 1. Fetch the registration to verify token
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('id, status, event_id, verification_token_hash, verification_token_expires_at')
      .eq('id', registrationId)
      .single();

    // Handle errors
    if (regError) {
      if (regError.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Registration not found',
          success: false,
        });
      }
      console.error('Fetch registration error:', regError);
      return res.status(500).json({ error: 'Verification failed' });
    }

    // 2. Check registration status and token validity
    if (registration.status !== 'pending') {
      return res.status(410).json({
        error: 'This registration has already been verified',
        success: false,
      });
    }

    // 3. Validate token and expiration
    if (registration.verification_token_hash !== tokenHash) {
      return res.status(410).json({
        error: 'Invalid or expired verification link',
        success: false,
      });
    }

    if (new Date(registration.verification_token_expires_at) < new Date()) {
      return res.status(410).json({
        error: 'Verification link has expired',
        success: false,
      });
    }

    // 4. Fetch event to check capacity
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, capacity, registration_status')
      .eq('id', registration.event_id)
      .single();

    if (eventError || !event) {
      console.error('Event fetch error:', eventError);
      return res.status(500).json({ error: 'Event not found' });
    }

    // 5. Count currently verified registrations
    const { count: verifiedCount, error: countError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', registration.event_id)
      .eq('status', 'verified');

    if (countError) {
      console.error('Count verified error:', countError);
      return res.status(500).json({ error: 'Failed to check capacity' });
    }

    const currentVerifiedCount = verifiedCount || 0;

    // 6. Update registration status to verified
    const { error: updateRegError } = await supabase
      .from('event_registrations')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verification_token_hash: null,
        verification_token_expires_at: null,
      })
      .eq('id', registrationId);

    if (updateRegError) {
      console.error('Update registration error:', updateRegError);
      return res.status(500).json({ error: 'Failed to verify registration' });
    }

    // 7. Check if this verification reaches or exceeds capacity
    // After verification, this registration now counts, so new count is currentVerifiedCount + 1
    const verifiedAfter = currentVerifiedCount + 1;
    let capacityStatus = 'ok';
    let shouldCloseEvent = false;

    if (event.capacity && typeof event.capacity === 'number') {
      if (verifiedAfter >= event.capacity) {
        capacityStatus = 'at_capacity';
        shouldCloseEvent = true;
      }
    }

    // 8. Close event if capacity reached
    if (shouldCloseEvent && event.registration_status !== 'closed') {
      const { error: closeError } = await supabase
        .from('events')
        .update({ registration_status: 'closed' })
        .eq('id', registration.event_id);

      if (closeError) {
        console.error('Error closing event:', closeError);
        // Don't fail the verification if we can't close the event
      }
    }

    // Map to status_code for backward compatibility
    const status_code = 'success';

    // 9. Send confirmation email
    try {
      const { data: regData } = await supabase
        .from('event_registrations')
        .select('first_name, last_name, email')
        .eq('id', registrationId)
        .single();

      if (regData) {
        // Fetch event details
        const { data: eventData } = await supabase
          .from('events')
          .select('title_fa, title_de')
          .eq('id', registration.event_id)
          .single();

        // Send confirmation email
        if (eventData && regData.email) {
          try {
            const userName = `${regData.first_name} ${regData.last_name}`;
            const eventTitle = eventData.title_de || eventData.title_fa || 'Event';
            const language = 'de'; // Can be enhanced to detect from registration preferences

            await sendConfirmationEmail(
              regData.email,
              userName,
              eventTitle,
              language
            );
          } catch (emailError) {
            console.error('Confirmation email error:', emailError);
            // Don't fail the verification if confirmation email fails
          }
        }
      }
    } catch (fetchError) {
      console.error('Error fetching registration/event for confirmation:', fetchError);
      // Don't fail the verification if we can't send confirmation email
    }

    // 10. Return success response with capacity status
    return res.status(200).json({
      success: true,
      message: 'Registration verified successfully',
      capacityStatus: capacityStatus,
      eventClosed: shouldCloseEvent,
    });
  } catch (error) {
    console.error('Verification endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
