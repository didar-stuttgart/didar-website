import { requireAdminSession } from '@/lib/api-middleware';
import { createAdminClient } from '@/lib/supabase';

export default async function handler(req, res) {
  // Verify admin session
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createAdminClient();

  if (req.method === 'GET') {
    // Fetch all CMS content from production
    try {
      const { data: items, error } = await supabase
        .from('cms_content')
        .select('*')
        .order('page', { ascending: true })
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return res.status(200).json({ items: items || [] });
    } catch (err) {
      console.error('Error fetching CMS content:', err);
      return res.status(500).json({ error: 'Failed to fetch content' });
    }
  }

  if (req.method === 'POST') {
    // Save CMS content item
    try {
      const { id, content_fa, content_de } = req.body;

      if (!id || !content_fa || !content_de) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { data, error } = await supabase
        .from('cms_content')
        .update({
          content_fa,
          content_de,
          updated_at: new Date().toISOString(),
          updated_by: req.user?.email || 'admin'
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      return res.status(200).json({ item: data?.[0] || {} });
    } catch (err) {
      console.error('Error saving CMS content:', err);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
