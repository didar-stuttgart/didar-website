/**
 * Public events API endpoint
 * GET /api/events - Fetch published events from Supabase
 *
 * Query parameters:
 * - category: 'recurring' | 'upcoming' | 'past' | 'all' (default: 'all')
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
import { categorizeEvents } from '@/lib/events-categorizer';

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { category = 'all' } = req.query;

    const supabase = createServerClient();

    // Fetch all published events
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Supabase error fetching events:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Categorize events
    const { recurring, upcoming, past } = categorizeEvents(events || []);

    // Select appropriate subset based on category parameter
    let selectedEvents = [...recurring, ...upcoming, ...past]; // 'all'
    if (category === 'recurring') {
      selectedEvents = recurring;
    } else if (category === 'upcoming') {
      selectedEvents = upcoming;
    } else if (category === 'past') {
      selectedEvents = past;
    }

    // Filter to only public-safe fields, removing admin_notes and other admin-only data
    const publicEvents = filterPublicEvents(selectedEvents);

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
