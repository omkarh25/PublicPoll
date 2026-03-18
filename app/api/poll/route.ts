/**
 * Poll API - Get today's poll
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getTodayPoll, getUserVote, getVoteCounts } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const poll = getTodayPoll();
    
    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    // Get user's vote if any
    const userVote = getUserVote(session.userId, poll.id);
    
    // Get all vote counts
    const voteCounts = getVoteCounts(poll.id);

    return NextResponse.json({
      poll,
      userVote: userVote ?? undefined,
      voteCounts,
    });
  } catch (error) {
    console.error('[API] Poll error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
