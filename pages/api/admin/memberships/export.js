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
    const { data: memberships, error } = await adminClient
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const bom = '﻿';
    const headers = [
      'نام اول',
      'نام خانوادگی',
      'ایمیل',
      'تلفن',
      'تلگرام',
      'اطلاعات اضافی',
      'وضعیت',
      'تاریخ درخواست',
      'یادداشت مدیر',
    ];

    const rows = memberships.map((m) => [
      m.first_name || '',
      m.last_name || '',
      m.email || '',
      m.phone || '',
      m.telegram_id || '',
      m.additional_info || '',
      m.status || '',
      m.created_at || '',
      m.admin_notes || '',
    ]);

    const csv =
      bom +
      headers.join(',') +
      '\n' +
      rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=memberships.csv');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export memberships error:', err);
    return res.status(500).json({ error: 'Failed to export memberships' });
  }
}
