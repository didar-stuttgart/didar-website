import { verifyPassword, generateSessionToken } from '@/lib/admin-auth';
import { createSession } from '@/lib/session-store-db';
import { validateRequired } from '@/lib/validation';
import { checkLoginAllowed, recordLoginFailure, clearLoginFailures } from '@/lib/login-throttle';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

function getClientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  const first = typeof fwd === 'string' ? fwd.split(',')[0].trim() : '';
  return first || req.socket?.remoteAddress || 'unknown';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientId = getClientIp(req);
    const gate = checkLoginAllowed(clientId);
    if (!gate.allowed) {
      res.setHeader('Retry-After', String(gate.retryAfter));
      return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }

    const { password } = req.body || {};

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
      recordLoginFailure(clientId);
      console.log('❌ LOGIN FAILED: Wrong password\n');
      return res.status(401).json({ error: 'Authentication failed' });
    }

    const token = generateSessionToken();
    await createSession(token);

    console.log('✅ LOGIN SUCCESS');
    clearLoginFailures(clientId);

    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('Set-Cookie',
      `session_token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${secure}`
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
