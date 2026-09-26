import { verifyPassword, generateSessionToken } from '@/lib/admin-auth';
import { createSession } from '@/lib/session-store-db';
import { validateRequired } from '@/lib/validation';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('\n📨 LOGIN REQUEST');
    const { password } = req.body;

    if (!validateRequired(password, 1, 500)) {
      console.log('❌ LOGIN FAILED: Password empty\n');
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH === 'will-be-generated-during-setup') {
      console.log('❌ LOGIN FAILED: Password not configured\n');
      return res.status(500).json({
        error: 'Admin password not configured',
      });
    }

    if (!verifyPassword(password, ADMIN_PASSWORD_HASH)) {
      console.log('❌ LOGIN FAILED: Wrong password\n');
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = generateSessionToken();
    await createSession(token);

    console.log('✅ LOGIN SUCCESS');
    console.log('🍪 Setting cookie: session_token');
    console.log('   Token:', token.substring(0, 16) + '...');
    console.log('   Max-Age: 86400 seconds (24 hours)\n');

    res.setHeader('Set-Cookie', 
      `session_token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
