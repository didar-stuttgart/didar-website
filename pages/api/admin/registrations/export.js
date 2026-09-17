import { validateSession } from '../../../../lib/admin-auth.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  const sessionToken = req.cookies?.admin_session;
  if (!sessionToken || !validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminClient = createAdminClient();
    const { data: registrations, error } = await adminClient
      .from('registrations')
      .select('*')
      .order('registration_date', { ascending: false });

    if (error) throw error;

    const bom = '﻿';
    const headers = [
      'نام اول',
      'نام خانوادگی',
      'ایمیل',
      'تلفن',
      'تلگرام',
      'رویداد',
      'وضعیت',
      'تاریخ ثبت',
      'نوشته',
      'یادداشت مدیر',
    ];

    const rows = registrations.map((r) => [
      r.first_name || '',
      r.last_name || '',
      r.email || '',
      r.phone || '',
      r.telegram_id || '',
      r.event || '',
      r.status || '',
      r.registration_date || '',
      r.comment || '',
      r.admin_notes || '',
    ]);

    const csv =
      bom +
      headers.join(',') +
      '\n' +
      rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export registrations error:', err);
    return res.status(500).json({ error: 'Failed to export registrations' });
  }
}
