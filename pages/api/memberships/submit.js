/**
 * Membership application submission endpoint — MANUAL MODEL
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 *
 * Manual membership flow:
 * - User fills out and submits form
 * - Application saved immediately with status='new'
 * - No automatic emails sent
 * - Admin reviews in admin panel and manually contacts applicant
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

    // Submit via SECURITY DEFINER RPC to bypass RLS
    // RPC: insert_membership_application_manual()
    const supabase = createServerClient();

    const { data: applicationId, error } = await supabase.rpc('insert_membership_application_manual', {
      first_name_param: firstName.trim(),
      last_name_param: lastName.trim(),
      email_param: email.trim().toLowerCase(),
      phone_param: phone?.trim() || null,
      telegram_id_param: telegramId?.trim() || null,
      additional_info_param: additionalInfo?.trim() || null,
    });

    if (error) {
      // Handle duplicate email (unique constraint)
      if (error.code === '23505') {
        return res.status(409).json({
          error: 'This email address has already been used to apply for membership',
        });
      }

      console.error('Supabase RPC error:', error);
      return res.status(500).json({ error: 'Failed to submit application' });
    }

    return res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully',
      id: applicationId,
    });
  } catch (error) {
    console.error('Membership submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
