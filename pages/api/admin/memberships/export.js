import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminClient = createAdminClient();
    const { data: memberships, error } = await adminClient
      .from('membership_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // CSV header
    const headers = ['Ù†Ø§Ù…', 'Ø§ÛŒÙ…ÛŒÙ„', 'ØªÙ„ÙÙ†', 'ØªÙ„Ú¯Ø±Ø§Ù…', 'ÙˆØ¶Ø¹ÛŒØª', 'ØªØ§Ø±ÛŒØ®', 'ÛŒØ§Ø¯Ø¯Ø§Ø´Øª'];
    const rows = (memberships || []).map((mem) => [
      `${mem.first_name} ${mem.last_name}`,
      mem.email,
      mem.phone || '',
      mem.telegram_id || '',
      mem.status || '',
      new Date(mem.created_at).toLocaleDateString('fa-IR', { calendar: 'gregory' }),
      mem.admin_notes || '',
    ]);

    // Build CSV with BOM for Excel
    const bom = 'ï»¿';
    const csv = bom + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="memberships.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export memberships error:', err);
    return res.status(500).json({ error: 'Failed to export memberships' });
  }
}

