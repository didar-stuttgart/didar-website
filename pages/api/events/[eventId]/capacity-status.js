/**
 * Event Capacity Status Endpoint
 * GET /api/events/{eventId}/capacity-status
 * Returns current capacity and verified registration count for real-time frontend updates
 */

import { createServerClient } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventId } = req.query;

    // Validate eventId
    if (!eventId || isNaN(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const supabase = createServerClient();

    // Fetch event capacity and registration status
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, capacity, registration_status')
      .eq('id', parseInt(eventId, 10))
      .eq('status', 'published')
      .single();

    if (eventError || !event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Count verified registrations
    const { count: verifiedCount, error: countError } = await supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', parseInt(eventId, 10))
      .eq('status', 'verified');

    if (countError) {
      console.error('Error counting verified registrations:', countError);
      return res.status(500).json({ error: 'Failed to fetch capacity status' });
    }

    const capacity = event.capacity || 0;
    const currentCount = verifiedCount || 0;
    const isFull = capacity > 0 && currentCount >= capacity;

    return res.status(200).json({
      capacity,
      verified_count: currentCount,
      is_full: isFull,
      slots_remaining: capacity > 0 ? Math.max(0, capacity - currentCount) : null,
      registration_status: event.registration_status,
    });
  } catch (error) {
    console.error('Capacity status endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
