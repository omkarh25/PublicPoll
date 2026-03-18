/**
 * Vote API - Submit a vote
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { submitVote } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, optionIndex } = body;

    if (questionId === undefined || optionIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing questionId or optionIndex' },
        { status: 400 }
      );
    }

    const result = submitVote(session.userId, questionId, optionIndex);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to submit vote' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
