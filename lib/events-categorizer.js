/**
 * Event Categorization Logic
 *
 * Priority order (CRITICAL):
 * 1. IF event_date is NULL/empty → UPCOMING (regardless of is_recurring)
 * 2. ELSE IF is_recurring = true → ONGOING/RECURRING
 * 3. ELSE IF event_date >= today → UPCOMING
 * 4. ELSE IF event_date < today → PAST
 *
 * This ensures that date-less events (recurring or otherwise) always appear in UPCOMING.
 */

export function categorizeEvents(events) {
  if (!events || !Array.isArray(events)) {
    return { recurring: [], upcoming: [], past: [] };
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const recurring = [];
  const upcoming = [];
  const past = [];

  events.forEach((event) => {
    // Priority 1: No date → always UPCOMING (regardless of is_recurring)
    if (!event.event_date) {
      upcoming.push(event);
    }
    // Priority 2: Has date AND recurring → ONGOING/RECURRING
    else if (event.is_recurring) {
      recurring.push(event);
    }
    // Priority 3: Has date AND future → UPCOMING
    else if (event.event_date >= today) {
      upcoming.push(event);
    }
    // Priority 4: Has date AND past → PAST
    else {
      past.push(event);
    }
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
