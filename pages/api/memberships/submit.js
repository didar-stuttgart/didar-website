/**
 * Membership application submission endpoint
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 */

import { createServerClient } from '@/lib/supabase';
import { validateMembershipApplication } from '@/lib/validation';
import { withRateLimit } from '@/lib/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, phone, telegramId, additionalInfo } = req.body;

    // Validate fields
    const validation = validateMembershipApplication({
      firstName,
      lastName,
      email,
      phone,
      telegramId,
      additionalInfo,
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
      .from('membership_applications')
      .insert([
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() || null,
          telegram_id: telegramId?.trim() || null,
          additional_info: additionalInfo?.trim() || null,
          status: 'new',
        },
      ])
      .select('id');

    if (error) {
      // Handle duplicate email
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'This email address has already been used to apply for membership',
        });
      }

      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to submit application' });
    }

    return res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully',
      id: data[0]?.id,
    });
  } catch (error) {
    console.error('Membership submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
