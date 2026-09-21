/**
 * Public events API endpoint
 * GET /api/events - Fetch published events from Supabase
 *
 * Query parameters:
 * - status: 'upcoming' | 'past' | 'all' (default: 'upcoming')
 *
 * Returns:
 * {
 *   success: true,
 *   events: [...],
 *   count: number
 * }
 */

import { createServerClient } from '@/lib/supabase';
import { filterPublicEvents } from '@/lib/events-filter';

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { status = 'upcoming' } = req.query;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const supabase = createServerClient();

    // Base query: only published events
    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    // Apply status filter
    if (status === 'upcoming') {
      // event_date >= today
      query = query.gte('event_date', today);
    } else if (status === 'past') {
      // event_date < today
      query = query.lt('event_date', today)
        .order('event_date', { ascending: false });
    }
    // 'all' has no additional filter, just published

    const { data: events, error } = await query;

    if (error) {
      console.error('Supabase error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Filter to only public-safe fields, removing admin_notes and other admin-only data
    const publicEvents = filterPublicEvents(events);

    // Set cache headers: 5 minutes for public data
    res.setHeader('Cache-Control', 'public, max-age=300');

    return res.status(200).json({
      success: true,
      events: publicEvents,
      count: publicEvents.length,
    });
  } catch (error) {
    console.error('Events API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default handler;
