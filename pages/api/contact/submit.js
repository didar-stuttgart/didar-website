/**
 * Contact form submission endpoint — MANUAL MODEL
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
 *
 * Manual contact flow:
 * - User fills out and submits form
 * - Submission saved immediately
 * - No automatic emails sent to user
 * - Admin receives notification email with all submitted details
 * - Admin reviews and manually responds
 */

import { createServerClient } from '@/lib/supabase';
import { validateContactForm } from '@/lib/validation';
import { withRateLimit } from '@/lib/middleware';
import { sendContactNotification } from '@/lib/admin-email';

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

    // Send admin notification. This is awaited (rather than fire-and-forget)
    // because Vercel serverless functions can freeze/terminate execution as
    // soon as the HTTP response is sent — an un-awaited notification call
    // here was being killed mid-flight before its fetch() to Resend ever
    // completed, which is why notifications were unreliable in production.
    // sendContactNotification() catches its own errors internally and never
    // throws, so awaiting it cannot fail this request or roll back the
    // database insert that already succeeded above.
    await sendContactNotification({
      submissionId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

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
