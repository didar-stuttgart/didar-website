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

    // Use admin client to call the RPC function (bypasses RLS)
    const supabase = createAdminClient();

    // Call the verify_registration_atomic RPC function
    const { data: result, error: rpcError } = await supabase
      .rpc('verify_registration_atomic', {
        registration_id_param: registrationId,
        token_hash_param: tokenHash,
      });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return res.status(500).json({ error: 'Verification failed' });
    }

    // The RPC returns an array with one object
    // Structure: [{ status_code: string, capacity_status: string }]
    if (!result || result.length === 0) {
      return res.status(500).json({ error: 'Verification failed' });
    }

    const { status_code, capacity_status } = result[0];

    // Handle different status codes and map to HTTP responses
    switch (status_code) {
      case 'not_found':
        return res.status(404).json({
          error: 'Registration not found',
          success: false,
        });

      case 'already_verified':
        return res.status(410).json({
          error: 'This registration has already been verified',
          success: false,
        });

      case 'invalid_token':
        return res.status(410).json({
          error: 'Invalid or expired verification link',
          success: false,
        });

      case 'success':
        // Verification succeeded - fetch registration and event details for confirmation email
        try {
          const { data: regData } = await supabase
            .from('event_registrations')
            .select('first_name, last_name, email, event_id')
            .eq('id', registrationId)
            .single();

          if (regData) {
            // Fetch event details
            const { data: eventData } = await supabase
              .from('events')
              .select('title_fa, title_de')
              .eq('id', regData.event_id)
              .single();

            // Send confirmation email
            if (eventData && regData.email) {
              try {
                const userName = `${regData.first_name} ${regData.last_name}`;
                const eventTitle = eventData.title_de || eventData.title_fa || 'Event';
                // Determine language (default to German if not specified)
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

        return res.status(200).json({
          success: true,
          message: 'Registration verified successfully',
          capacityStatus: capacity_status,
        });

      default:
        console.error('Unexpected status code from RPC:', status_code);
        return res.status(500).json({ error: 'Unexpected response from verification' });
    }
  } catch (error) {
    console.error('Verification endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
