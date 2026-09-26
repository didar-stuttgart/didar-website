import { requireAdminSession } from '@/lib/api-middleware';
import { createAdminClient } from '@/lib/supabase';

export default async function handler(req, res) {
  // Verify admin session
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createAdminClient();

  if (req.method === 'GET') {
    // Fetch all organization_settings from production
    try {
      const { data: items, error } = await supabase
        .from('organization_settings')
        .select('*')
        .order('key', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ items: items || [] });
    } catch (err) {
      console.error('Error fetching organization settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'POST') {
    // Save organization_settings item
    try {
      const { id, value_text, value_text_fa, value_text_de, value_json } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData = {
        updated_at: new Date().toISOString(),
        updated_by: req.user?.email || 'admin'
      };

      // Add non-null values to update
      if (value_text !== undefined) updateData.value_text = value_text;
      if (value_text_fa !== undefined) updateData.value_text_fa = value_text_fa;
      if (value_text_de !== undefined) updateData.value_text_de = value_text_de;
      if (value_json !== undefined) updateData.value_json = value_json;

      const { data, error } = await supabase
        .from('organization_settings')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      return res.status(200).json({ item: data?.[0] || {} });
    } catch (err) {
      console.error('Error saving organization settings:', err);
      return res.status(500).json({ error: 'Failed to save settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
