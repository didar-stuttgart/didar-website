import { validateSession } from '../../../lib/session-store.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cookieHeader = req.headers.cookie || '';
  console.log('\n📨 VERIFY REQUEST');
  console.log('📦 Raw cookie header:', cookieHeader ? cookieHeader.substring(0, 100) + '...' : '(empty)');
  
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  console.log('🔍 Parsed cookie keys:', Object.keys(cookies).join(', '));
  
  const sessionToken = cookies?.session_token;
  console.log('🔑 session_token present:', !!sessionToken);
  if (sessionToken) {
    console.log('   Token preview:', sessionToken.substring(0, 16) + '...');
  }

  if (!sessionToken) {
    console.log('❌ VERIFY FAILED: No session_token cookie\n');
    return res.status(401).json({ error: 'Unauthorized - no token' });
  }

  if (!validateSession(sessionToken)) {
    console.log('❌ VERIFY FAILED: Invalid or expired session\n');
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }

  console.log('✅ VERIFY SUCCESS\n');
  return res.status(200).json({ valid: true });
}
