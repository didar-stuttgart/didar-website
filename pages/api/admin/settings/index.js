import { validateSession } from '../../../../lib/admin-auth.js';

let settingsStore = {
  contact_email: 'info@didar.de',
  telegram_channel: '@didar_channel',
  telegram_contact: '@didar_contact',
  instagram_url: 'https://instagram.com/didar',
};

export default function handler(req, res) {
  const sessionToken = req.cookies?.admin_session;
  if (!sessionToken || !validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    return handleGetSettings(req, res);
  } else if (req.method === 'POST') {
    return handleSaveSettings(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleGetSettings(req, res) {
  res.status(200).json({ settings: settingsStore });
}

function handleSaveSettings(req, res) {
  try {
    const { settings } = req.body;
    settingsStore = { ...settingsStore, ...settings };
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Save settings error:', err);
    res.status(500).json({ error: 'Failed to save settings' });
  }
}
