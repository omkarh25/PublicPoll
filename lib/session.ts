/**
 * Session management for the PublicPoll app
 * Simple cookie-based session storage for user authentication
 * 
 * NOTE: This file contains server-side session functions.
 * Client components should use the /api/session endpoint instead.
 */

import { cookies } from 'next/headers';

const SESSION_COOKIE = 'publicpoll_session';

/**
 * Session data structure
 */
export interface SessionData {
  userId: number;
  aadhaarNumber: string;
  phone: string;
}

/**
 * Save session data to cookies (Server-side only)
 */
export async function saveSession(data: SessionData) {
  const cookieStore = await cookies();
  
  const sessionValue = JSON.stringify(data);
  
  cookieStore.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
  
  console.log('[Session] Session saved for user:', data.aadhaarNumber);
}

/**
 * Get session data from cookies (Server-side only)
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie) {
    return null;
  }
  
  try {
    const data = JSON.parse(sessionCookie.value) as SessionData;
    return data;
  } catch (error) {
    console.error('[Session] Failed to parse session:', error);
    return null;
  }
}

/**
 * Clear session (logout) - Server-side only
 */
export async function clearSession() {
  const cookieStore = await cookies();
  
  cookieStore.delete(SESSION_COOKIE);
  
  console.log('[Session] Session cleared');
}
