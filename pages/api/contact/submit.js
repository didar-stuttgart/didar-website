/**
 * Contact form submission endpoint
 * Public endpoint - no authentication required
 * Rate limited to prevent spam
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

    // Submit to Supabase
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          message: message.trim(),
        },
      ])
      .select('id');

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to submit contact message' });
    }

    return res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully',
      id: data[0]?.id,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with rate limiting
export default withRateLimit(handler);
