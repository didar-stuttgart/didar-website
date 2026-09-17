import { requireAdminSession } from '../../../../lib/api-middleware.js';

// In-memory storage for content
let contentStore = {
  homepage_hero_title_fa: 'دیدار',
  homepage_hero_subtitle_fa: 'انجمن فرهنگی دانشجویی',
  homepage_hero_title_de: 'Didar',
  homepage_hero_subtitle_de: 'Iranische Kulturgemeinschaft',
  about_intro_fa: '',
  about_intro_de: '',
};

export default function handler(req, res) {
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetContent(req, res);
  } else if (req.method === 'POST') {
    return handleSaveContent(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGetContent(req, res) {
  res.status(200).json({ content: contentStore });
}

function handleSaveContent(req, res) {
  try {
    const { content } = req.body;
    contentStore = { ...contentStore, ...content };
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Save content error:', err);
    res.status(500).json({ error: 'Failed to save content' });
  }
}
