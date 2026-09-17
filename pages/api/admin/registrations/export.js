import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!requireAdminSession(req, res)) {
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

    // CSV header
    const headers = ['نام', 'ایمیل', 'تلفن', 'تلگرام', 'رویداد', 'وضعیت', 'تاریخ', 'یادداشت'];
    const rows = (registrations || []).map((reg) => [
      `${reg.first_name} ${reg.last_name}`,
      reg.email,
      reg.phone || '',
      reg.telegram_id || '',
      reg.event || '',
      reg.status || '',
      new Date(reg.registration_date).toLocaleDateString('fa-IR'),
      reg.admin_notes || '',
    ]);

    // Build CSV with BOM for Excel
    const bom = '﻿';
    const csv = bom + [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="registrations.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('Export registrations error:', err);
    return res.status(500).json({ error: 'Failed to export registrations' });
  }
}
