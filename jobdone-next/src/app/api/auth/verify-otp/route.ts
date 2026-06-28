import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { phone, firebaseToken } = await req.json();

    if (!phone || !firebaseToken) {
      return NextResponse.json({ success: false, message: 'Phone and firebase token are required' }, { status: 400 });
    }

    // In a real app, verify the firebaseToken with firebase-admin here.
    // For this implementation, we assume the client successfully verified with Firebase.

    let user = await prisma.user.findUnique({ where: { phone } });
    
    let isNewUser = false;
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone,
          isVerified: true
        }
      });
      isNewUser = true;
    }

    // Generate JWT
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone }, 
      process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key', 
      { expiresIn: '7d' } // Increased to 7 days for development
    );

    const refreshTokenString = jwt.sign(
      { id: user.id }, 
      process.env.JWT_REFRESH_SECRET || 'jobdone_refresh_secret_key', 
      { expiresIn: '7d' }
    );

    // Store session
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: refreshTokenString,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    // Set secure HTTP-only cookie for refresh token using Next.js cookies API
    (await cookies()).set('refresh_token', refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60
    });

    return NextResponse.json({
      success: true,
      isNewUser,
      accessToken,
      user
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
