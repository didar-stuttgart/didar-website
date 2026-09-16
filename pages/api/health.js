/**
 * Health check endpoint
 * Used to verify deployment and Supabase connectivity
 */

import { createServerClient } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerClient();

    // Test Supabase connectivity
    const { data, error } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (error) {
      return res.status(503).json({
        status: 'unhealthy',
        error: 'Database connection failed',
      });
    }

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supabase: 'connected',
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
}
