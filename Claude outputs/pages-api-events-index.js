/**
 * GET /api/events
 * Public endpoint to fetch events from Supabase
 * Query params:
 *   - status: 'upcoming' | 'past' | 'all' (default: 'upcoming')
 */

import { createServerClient } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status = 'upcoming' } = req.query;
    const supabase = createServerClient();

    // Today's date in YYYY-MM-DD format for comparison
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('events')
      .select('id, slug, title_fa, title_de, date, time, image_url, location_fa, location_de, description_fa, description_de, registration_status, speaker_fa, speaker_de, artist_fa, artist_de, program_fa, program_de')
      .eq('is_published', true)
      .order('date', { ascending: status === 'upcoming' });

    // Filter by event date relative to today
    if (status === 'upcoming') {
      query = query.gte('date', today);
    } else if (status === 'past') {
      query = query.lt('date', today);
    }
    // If status === 'all', no date filter

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error fetching events:', error);
      return res.status(500).json({
        error: 'Failed to fetch events',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    // Set cache headers - events don't change frequently
    // Cache for 5 minutes on CDN/browser
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');

    return res.status(200).json({
      success: true,
      events: data || [],
      count: data?.length || 0,
      status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
