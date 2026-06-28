import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 });
    }

    // Since Firebase handles the actual OTP generation and SMS sending,
    // we just check if the user exists. If not, we don't create them yet,
    // we wait until they verify the OTP.
    
    // In a real production scenario with our own SMS gateway, we would 
    // generate an OTP and store it here.
    
    // For now, return success to let the client know it can proceed with Firebase.

    return NextResponse.json({
      success: true,
      message: 'OTP request received. Firebase will handle the SMS.'
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
