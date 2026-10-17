import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';
import { buildCsv } from '../../../../lib/csv.js';

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
    const headers = ['نام', 'ایمیل', 'تلفن', 'تلگرام', 'وضعیت', 'تاریخ', 'یادداشت'];
    const rows = (memberships || []).map((mem) => [
      `${mem.first_name} ${mem.last_name}`,
      mem.email,
      mem.phone || '',
      mem.telegram_id || '',
      mem.status || '',
      new Date(mem.created_at).toLocaleDateString('fa-IR', { calendar: 'gregory' }),
      mem.admin_notes || '',
    ]);

    // UTF-8 BOM + escaped cells (see lib/csv.js)
    const csv = buildCsv(headers, rows);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="memberships.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export memberships error:', err);
    return res.status(500).json({ error: 'Failed to export memberships' });
  }
}

