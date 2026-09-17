import { deleteSession } from '@/lib/session-store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    const sessionToken = cookies?.session_token;

    if (sessionToken) {
      console.log('\n📨 LOGOUT REQUEST');
      deleteSession(sessionToken);
      console.log('🔓 Session cleared\n');
    }

    res.setHeader('Set-Cookie', 
      'session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
    );

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
