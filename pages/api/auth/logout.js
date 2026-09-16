/**
 * Admin logout endpoint
 * Clears the admin session
 */

import { deleteSession } from '@/lib/admin-auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { admin_session: sessionToken } = req.cookies;

    if (sessionToken) {
      deleteSession(sessionToken);
    }

    // Clear cookie
    res.setHeader('Set-Cookie', [
      'admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict',
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
