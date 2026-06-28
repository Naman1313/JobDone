import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getCurrentUser(req);
    if (!session?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Don't send sensitive info
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getCurrentUser(req);
    if (!session?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, bio, trades, skills, location, portfolioUrls, certificates, avatarUrl, coverUrl } = body;

    // Check if profile exists, update or create
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.id },
      update: {
        firstName, lastName, bio, trades, skills, location, portfolioUrls, certificates, avatarUrl, coverUrl
      },
      create: {
        userId: session.id,
        firstName, lastName, bio, trades, skills, location, portfolioUrls, certificates, avatarUrl, coverUrl
      }
    });

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error', stack: error?.stack }, { status: 500 });
  }
}
