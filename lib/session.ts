import { cookies, headers } from 'next/headers';

export interface AdminSession {
  isAdmin: boolean;
  timestamp: number;
}

const ADMIN_COOKIE_NAME = 'nfl-squares-admin';

/**
 * Determines if secure cookies should be used.
 * Returns true if:
 * - FORCE_SECURE_COOKIES env var is set to 'true', OR
 * - Request is coming through HTTPS (X-Forwarded-Proto header)
 */
async function shouldUseSecureCookies(): Promise<boolean> {
  // Check environment variable override
  if (process.env.FORCE_SECURE_COOKIES === 'true') {
    return true;
  }
  if (process.env.FORCE_SECURE_COOKIES === 'false') {
    return false;
  }

  // Auto-detect based on request headers (for reverse proxy)
  try {
    const headersList = await headers();
    const proto = headersList.get('x-forwarded-proto');
    
    // If behind reverse proxy with HTTPS
    if (proto === 'https') {
      return true;
    }
  } catch (error) {
    // Headers not available, fall back to env check
  }

  // Default to false for local/HTTP access
  return false;
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const useSecure = await shouldUseSecureCookies();
  
  console.log(`🍪 Setting admin session cookie (secure: ${useSecure})`);
  
  cookieStore.set(ADMIN_COOKIE_NAME, JSON.stringify({ isAdmin: true, timestamp: Date.now() }), {
    httpOnly: true,
    secure: useSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 2, // 2 hours
  });
  
  console.log(`✅ Admin session cookie set successfully`);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  
  console.log(`🔍 Checking for admin session cookie: ${sessionCookie ? 'FOUND' : 'NOT FOUND'}`);
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const session = JSON.parse(sessionCookie.value);
    console.log(`✅ Admin session validated`);
    return session;
  } catch (error) {
    console.log(`❌ Failed to parse admin session cookie`);
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
