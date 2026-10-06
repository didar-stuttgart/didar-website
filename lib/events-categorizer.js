/**
 * Event Categorization Logic
 *
 * Priority order:
 * 1. IF event_date is NULL/empty → UPCOMING
 * 2. ELSE IF is_recurring = true → ONGOING/RECURRING
 * 3. ELSE IF event_date >= today → UPCOMING
 * 4. ELSE IF event_date < today → PAST
 *
 * Upcoming events are ordered by date first, with date-less events last.
 */

export function categorizeEvents(events) {
  if (!events || !Array.isArray(events)) {
    return { recurring: [], upcoming: [], past: [] };
  }

  const today = new Date().toISOString().split('T')[0];

  const recurring = [];
  const upcoming = [];
  const past = [];

  events.forEach((event) => {
    if (!event.event_date) {
      upcoming.push(event);
    } else if (event.is_recurring) {
      recurring.push(event);
    } else if (event.event_date >= today) {
      upcoming.push(event);
    } else {
      past.push(event);
    }
  });

  upcoming.sort((a, b) => {
    if (!a.event_date) return 1;
    if (!b.event_date) return -1;
    return a.event_date.localeCompare(b.event_date);
  });

  return { recurring, upcoming, past };
}

/**
 * Get events by category
 * Published events only
 */
export async function getCategorizedEvents(supabase) {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Supabase error fetching events:', error);
      return null;
    }

    return categorizeEvents(events);
  } catch (error) {
    console.error('Error fetching categorized events:', error);
    return null;
  }
}