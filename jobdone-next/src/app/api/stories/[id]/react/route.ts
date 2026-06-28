import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json({ success: false, message: 'Emoji is required' }, { status: 400 });
    }


    // Check if story exists and is not expired
    const story = await prisma.story.findUnique({
      where: { id: storyId }
    });

    if (!story || story.expiresAt < new Date()) {
      return NextResponse.json({ success: false, message: 'Story not found or expired' }, { status: 404 });
    }

    // Upsert reaction (create if doesn't exist, update emoji if it does)
    const reaction = await prisma.storyReaction.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: decoded.id
        }
      },
      update: {
        emoji
      },
      create: {
        storyId,
        userId: decoded.id,
        emoji
      }
    });

    return NextResponse.json({ success: true, data: reaction });
  } catch (error) {
    console.error('React Story Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
