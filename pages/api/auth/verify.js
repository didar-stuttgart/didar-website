import { validateSession } from '../../../lib/session-store-db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  console.log('\n📨 VERIFY REQUEST');
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  
  const sessionToken = cookies?.session_token;

  if (!sessionToken) {
    console.log('❌ VERIFY FAILED: No session_token cookie\n');
    return res.status(401).json({ error: 'Unauthorized - no token' });
  }

  if (!(await validateSession(sessionToken))) {
    console.log('❌ VERIFY FAILED: Invalid or expired session\n');
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }

  console.log('✅ VERIFY SUCCESS\n');
  return res.status(200).json({ valid: true });
}
