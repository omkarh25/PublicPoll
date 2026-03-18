/**
 * Comments API - Get and submit comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getComments, submitComment } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId' },
        { status: 400 }
      );
    }

    const comments = getComments(parseInt(questionId));

    return NextResponse.json(comments);
  } catch (error) {
    console.error('[API] Comments GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { questionId, commentText } = body;

    if (!questionId || !commentText) {
      return NextResponse.json(
        { error: 'Missing questionId or commentText' },
        { status: 400 }
      );
    }

    const result = submitComment(session.userId, questionId, commentText);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Comments POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
