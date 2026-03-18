/**
 * Session API - Get current session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }
    
    return NextResponse.json({
      authenticated: true,
      session,
    });
  } catch (error) {
    console.error('[API] Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
