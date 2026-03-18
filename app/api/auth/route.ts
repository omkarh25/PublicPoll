/**
 * Authentication API - Mock Aadhaar OTP Verification
 * Handles OTP verification and session creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrGetUser } from '@/lib/db';
import { saveSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, aadhaarNumber, phone, otp } = body;

    if (action === 'verify') {
      // Mock OTP validation - any 6-digit code is valid
      if (!otp || otp.length !== 6) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      // Create or get user (permanent Aadhaar link)
      const user = createOrGetUser(aadhaarNumber, phone);

      // Save session
      await saveSession({
        userId: user.id,
        aadhaarNumber: user.aadhaar_number,
        phone: user.phone,
      });

      console.log(`[API] User verified: ${aadhaarNumber}`);

      return NextResponse.json({
        success: true,
        message: 'Verification successful',
        user: {
          id: user.id,
          aadhaarNumber: user.aadhaar_number,
          phone: user.phone,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[API] Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
