/**
 * Contact form submission endpoint — MANUAL MODEL
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 *
 * Manual contact flow:
 * - User fills out and submits form
 * - Submission saved immediately
 * - No automatic emails sent
 * - Admin reviews and manually responds
 */

import { createServerClient } from '@/lib/supabase';
import { validateContactForm } from '@/lib/validation';
import { withRateLimit } from '@/lib/middleware';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    // Validate fields
    const validation = validateContactForm({
      name,
      email,
      message,
    });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Submit via SECURITY DEFINER RPC to bypass table access restrictions
    // RPC: insert_contact_submission_manual()
    const supabase = createServerClient();

    const { data: submissionId, error } = await supabase.rpc('insert_contact_submission_manual', {
      name_param: name.trim(),
      email_param: email.trim().toLowerCase(),
      message_param: message.trim(),
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return res.status(500).json({ error: 'Failed to submit contact message' });
    }

    return res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      id: submissionId,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
