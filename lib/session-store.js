/**
 * Simple in-memory session store
 * Persists across requests within the same server instance
 */

const activeSessions = new Map();

export function createSession(token, expiresAt = null) {
  const expires = expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000);
  activeSessions.set(token, {
    createdAt: new Date(),
    expiresAt: expires,
  });
  console.log('✅ Session created:', token.substring(0, 8) + '...', 'expires at', expires.toISOString());
  return token;
}

export function validateSession(token) {
  if (!token) {
    console.log('❌ No token provided');
    return false;
  }

  const session = activeSessions.get(token);
  if (!session) {
    console.log('❌ Token not found in store:', token.substring(0, 8) + '...');
    return false;
  }

  const now = new Date();
  if (now > session.expiresAt) {
    console.log('❌ Session expired:', token.substring(0, 8) + '...');
    activeSessions.delete(token);
    return false;
  }

  console.log('✅ Session valid:', token.substring(0, 8) + '...');
  return true;
}

export function deleteSession(token) {
  activeSessions.delete(token);
  console.log('🔓 Session deleted:', token.substring(0, 8) + '...');
}

export function clearExpiredSessions() {
  const now = new Date();
  let deleted = 0;
  for (const [token, session] of activeSessions.entries()) {
    if (now > session.expiresAt) {
      activeSessions.delete(token);
      deleted++;
    }
  }
  if (deleted > 0) {
    console.log('🧹 Cleared', deleted, 'expired sessions');
  }
}

export function getSessionCount() {
  return activeSessions.size;
}
