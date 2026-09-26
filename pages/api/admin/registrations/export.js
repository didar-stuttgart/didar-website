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
    const { data: registrations, error } = await adminClient
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // CSV header
    const headers = ['Ù†Ø§Ù…', 'Ø§ÛŒÙ…ÛŒÙ„', 'ØªÙ„ÙÙ†', 'ØªÙ„Ú¯Ø±Ø§Ù…', 'Ø±ÙˆÛŒØ¯Ø§Ø¯', 'ÙˆØ¶Ø¹ÛŒØª', 'ØªØ§Ø±ÛŒØ®', 'ÛŒØ§Ø¯Ø¯Ø§Ø´Øª'];
    const rows = (registrations || []).map((reg) => [
      `${reg.first_name} ${reg.last_name}`,
      reg.email,
      reg.phone || '',
      reg.telegram_id || '',
      reg.event || '',
      reg.status || '',
      new Date(reg.created_at).toLocaleDateString('fa-IR', { calendar: 'gregory' }),
      reg.admin_notes || '',
    ]);

    // Build CSV with BOM for Excel
    const bom = 'ï»¿';
    const csv = bom + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export registrations error:', err);
    return res.status(500).json({ error: 'Failed to export registrations' });
  }
}

