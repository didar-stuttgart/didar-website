# DIDAR Admin Panel — Code Examples & Patterns

Quick reference for common coding patterns used in the admin panel.

---

## Frontend: Checking Session on Page Load

```javascript
// Pattern used in all admin pages (pages/admin/*.js)

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  const [sessionValid, setSessionValid] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Step 1: Verify session is still valid
        const response = await fetch('/api/auth/verify', { 
          method: 'POST', 
          credentials: 'include'  // ← CRITICAL: Include cookies
        });
        
        if (response.ok) {
          setSessionValid(true);
          loadData();  // ← Only load data if session valid
        } else {
          // Session invalid, redirect to login
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        router.push('/admin/login');
      }
    };

    checkSession();
  }, [router]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/some-endpoint', { 
        credentials: 'include'  // ← Always include credentials
      });
      
      if (res.ok) {
        const data = await res.json();
        setData(data);
      } else if (res.status === 401) {
        // Session expired during page use
        router.push('/admin/login');
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setLoading(false);
    }
  };

  if (!sessionValid || loading) {
    return <div>درحال بارگذاری...</div>;
  }

  return (
    <div>
      {/* Render admin content */}
    </div>
  );
}
```

---

## Frontend: Making Authenticated Requests

```javascript
// Pattern for POST, PATCH, DELETE requests

const handleUpdateData = async (id, newData) => {
  try {
    const res = await fetch(`/api/admin/endpoint/${id}`, {
      method: 'PATCH',  // or POST, DELETE
      credentials: 'include',  // ← Must include
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(newData)
    });

    if (res.ok) {
      const result = await res.json();
      console.log('Success:', result);
      // Update UI optimistically or reload
    } else if (res.status === 401) {
      // Session expired
      router.push('/admin/login');
    } else {
      console.error('Error:', res.status);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
};
```

---

## Backend: Protecting an Admin Endpoint

```javascript
// Pattern for pages/api/admin/*.js

import { requireAdminSession } from '@/lib/api-middleware';
import { createAdminClient } from '@/lib/supabase';

export default async function handler(req, res) {
  // Step 1: Check authentication FIRST
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Step 2: Check HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 3: If we reach here, session is valid
    // Use admin client (full database access)
    const adminClient = createAdminClient();

    // Query database
    const { data, error } = await adminClient
      .from('events')
      .select('*')
      .eq('status', 'published');

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Database error' });
    }

    // Step 4: Return data
    return res.status(200).json({ events: data });

  } catch (err) {
    console.error('Endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Backend: Login Endpoint

```javascript
// pages/api/auth/login.js

import { verifyPassword, generateSessionToken } from '@/lib/admin-auth';
import { createSession } from '@/lib/session-store';
import { validateRequired } from '@/lib/validation';

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    // Validate input
    if (!validateRequired(password, 1, 500)) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check password hash is configured
    if (!ADMIN_PASSWORD_HASH || ADMIN_PASSWORD_HASH === 'will-be-generated-during-setup') {
      return res.status(500).json({ error: 'Admin password not configured' });
    }

    // Verify password
    if (!verifyPassword(password, ADMIN_PASSWORD_HASH)) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Password correct — create session
    const token = generateSessionToken();
    createSession(token);

    // Return session token as cookie
    res.setHeader('Set-Cookie', 
      `session_token=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`
    );

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Backend: Logout Endpoint

```javascript
// pages/api/auth/logout.js

import { deleteSession } from '@/lib/session-store';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract session token from cookie
    const cookieHeader = req.headers.cookie || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = decodeURIComponent(value);
      }
      return acc;
    }, {});

    const sessionToken = cookies?.session_token;

    // If session exists, delete it
    if (sessionToken) {
      deleteSession(sessionToken);
    }

    // Clear cookie
    res.setHeader('Set-Cookie', 
      'session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
    );

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

---

## Backend: Verify Endpoint

```javascript
// pages/api/auth/verify.js

import { validateSession } from '../../../lib/session-store.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract session token from cookie
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});

  const sessionToken = cookies?.session_token;

  // Check if token exists
  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized - no token' });
  }

  // Validate token (checks session-store.js)
  if (!validateSession(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized - invalid token' });
  }

  // Token valid
  return res.status(200).json({ valid: true });
}
```

---

## Library: Session Store (Single Source of Truth)

```javascript
// lib/session-store.js

const activeSessions = new Map();

export function createSession(token, expiresAt = null) {
  // Create 24h session if no expiry specified
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

  // Check if expired
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
```

---

## Library: Password Hashing & Verification

```javascript
// lib/admin-auth.js

import crypto from 'crypto';

export function hashPassword(password) {
  // Generate random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Hash password with salt (10,000 iterations)
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');
  
  // Return combined salt:hash
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  // Validate stored hash format
  if (!storedHash || typeof storedHash !== 'string') {
    return false;
  }

  // Split salt and hash
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  // Hash input password with stored salt
  const inputHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha256')
    .toString('hex');

  // Compare hashes
  return inputHash === hash;
}

export function validatePassword(password) {
  const errors = [];

  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function generateSessionToken() {
  // Generate 32 random bytes = 64 hex characters
  // ~256 bits of entropy
  return crypto.randomBytes(32).toString('hex');
}
```

---

## Middleware: Session Checking

```javascript
// lib/api-middleware.js

import { validateSession } from './session-store.js';

export function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
}

export function requireAdminSession(req, res) {
  // Parse cookies
  const cookies = parseCookies(req);
  const sessionToken = cookies?.session_token;

  // Check if token exists and is valid
  if (!sessionToken || !validateSession(sessionToken)) {
    return false;  // Caller should return 401
  }

  return true;  // Session is valid, continue
}
```

---

## Complete Endpoint Example: GET /api/admin/stats

```javascript
// pages/api/admin/stats.js

import { requireAdminSession } from '../../../lib/api-middleware.js';
import { createAdminClient } from '../../../lib/supabase.js';

export default async function handler(req, res) {
  // Step 1: Protect endpoint with session check
  if (!requireAdminSession(req, res)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Step 2: Get admin database client
    const adminClient = createAdminClient();

    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Step 3: Query database (now that we're authenticated)
    
    // Count upcoming events
    const { data: events } = await adminClient
      .from('events')
      .select('slug')
      .eq('status', 'published')
      .gte('event_date', today.toISOString().split('T')[0]);

    // Count new registrations this week
    const { data: registrations } = await adminClient
      .from('event_registrations')
      .select('id')
      .gte('created_at', weekAgo.toISOString());

    // Count new memberships this week
    const { data: memberships } = await adminClient
      .from('membership_applications')
      .select('id')
      .gte('created_at', weekAgo.toISOString());

    // Step 4: Return stats
    return res.status(200).json({
      upcomingEvents: events?.length || 0,
      newRegistrations: registrations?.length || 0,
      newMemberships: memberships?.length || 0,
    });

  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to load stats' });
  }
}
```

---

## Testing: Login Flow (Manual Steps)

```bash
# 1. POST to login with password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"YourPassword123!"}' \
  -c cookies.txt  # Save cookies to file

# 2. Check if login succeeded
cat cookies.txt  # Should show session_token cookie

# 3. Verify session is valid
curl -X POST http://localhost:3000/api/auth/verify \
  -b cookies.txt  # Use saved cookies

# 4. Access admin endpoint
curl -X GET http://localhost:3000/api/admin/stats \
  -b cookies.txt

# 5. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt

# 6. Try admin endpoint again (should fail with 401)
curl -X GET http://localhost:3000/api/admin/stats \
  -b cookies.txt  # Will be rejected
```

---

## Debugging: Common Console Logs

The authentication system logs helpful debug info. Look for patterns:

```
✅ Session created: abc12345... expires at 2026-09-22T12:34:56.789Z
✅ Session valid: abc12345...
❌ Session expired: abc12345...
❌ Token not found in store: abc12345...
❌ VERIFY FAILED: Invalid or expired session
✅ VERIFY SUCCESS
✅ LOGIN SUCCESS
❌ LOGIN FAILED: Wrong password
```

When debugging, check server logs for these patterns.

---

## Best Practices When Adding to Admin Panel

1. **Always check session first** in endpoints:
   ```javascript
   if (!requireAdminSession(req, res)) return res.status(401).json({...});
   ```

2. **Always include credentials** in frontend fetches:
   ```javascript
   fetch('/api/admin/...', { credentials: 'include' })
   ```

3. **Always handle 401 responses** in frontend:
   ```javascript
   if (res.status === 401) router.push('/admin/login');
   ```

4. **Use admin client, not public client** in admin endpoints:
   ```javascript
   createAdminClient()  // ← RIGHT (full access)
   // NOT: createPublicClient()  // Would be blocked by RLS
   ```

5. **Never expose secret key** to frontend:
   ```javascript
   // WRONG: window.SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
   // RIGHT: Only use in /api/* routes
   ```

---

## For Further Reference

- Full architecture: `claude/19_ADMIN_PANEL_COMPLETE_ARCHITECTURE.md`
- Quick reference: `ADMIN_PANEL_QUICK_REFERENCE.md`
- Visual guide: Open `admin_architecture_diagram.html` in browser
