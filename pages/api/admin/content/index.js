import { requireAdminSession } from '../../../../lib/api-middleware.js';
import { createAdminClient } from '../../../../lib/supabase.js';

export default async function handler(req, res) {
  if (!(await requireAdminSession(req, res))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return await handleGetContent(req, res);
  } else if (req.method === 'POST') {
    return await handleSaveContent(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetContent(req, res) {
  try {
    const adminClient = createAdminClient();
    const { data: contentArray, error } = await adminClient
      .from('content')
      .select('*')
      .limit(1);

    if (error) throw error;

    // Convert array to object (there should only be one row)
    const content = contentArray && contentArray.length > 0
      ? contentArray[0]
      : {
          homepage_hero_title_fa: '',
          homepage_hero_subtitle_fa: '',
          homepage_hero_title_de: '',
          homepage_hero_subtitle_de: '',
          about_intro_fa: '',
          about_intro_de: '',
        };

    return res.status(200).json({ content });
  } catch (err) {
    console.error('Get content error:', err);
    return res.status(500).json({ error: 'Failed to load content' });
  }
}

async function handleSaveContent(req, res) {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const adminClient = createAdminClient();

    // Check if content row exists
    const { data: existingContent, error: checkError } = await adminClient
      .from('content')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;

    let result;
    if (existingContent && existingContent.length > 0) {
      // Update existing content
      const { data, error } = await adminClient
        .from('content')
        .update({
          homepage_hero_title_fa: content.homepage_hero_title_fa || '',
          homepage_hero_subtitle_fa: content.homepage_hero_subtitle_fa || '',
          homepage_hero_title_de: content.homepage_hero_title_de || '',
          homepage_hero_subtitle_de: content.homepage_hero_subtitle_de || '',
          about_intro_fa: content.about_intro_fa || '',
          about_intro_de: content.about_intro_de || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingContent[0].id)
        .select();

      if (error) throw error;
      result = data;
    } else {
      // Insert new content
      const { data, error } = await adminClient
        .from('content')
        .insert([
          {
            homepage_hero_title_fa: content.homepage_hero_title_fa || '',
            homepage_hero_subtitle_fa: content.homepage_hero_subtitle_fa || '',
            homepage_hero_title_de: content.homepage_hero_title_de || '',
            homepage_hero_subtitle_de: content.homepage_hero_subtitle_de || '',
            about_intro_fa: content.about_intro_fa || '',
            about_intro_de: content.about_intro_de || '',
          },
        ])
        .select();

      if (error) throw error;
      result = data;
    }

    return res.status(200).json({ success: true, content: result[0] });
  } catch (err) {
    console.error('Save content error:', err);
    return res.status(500).json({ error: 'Failed to save content' });
  }
}

