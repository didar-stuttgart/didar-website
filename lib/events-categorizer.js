/**
 * Event Categorization Logic
 *
 * Categorizes events into three types:
 * - recurring: is_recurring = true (no fixed date)
 * - upcoming: is_recurring = false AND event_date >= today
 * - past: is_recurring = false AND event_date < today
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
    if (event.is_recurring) {
      // Recurring events: always categorized as "Ongoing / Recurring"
      recurring.push(event);
    } else {
      // Non-recurring events: categorized by date
      if (event.event_date && event.event_date < today) {
        // Has a date AND date is in the past
        past.push(event);
      } else {
        // No date, OR has a date >= today
        // Both are categorized as "Upcoming"
        upcoming.push(event);
      }
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
