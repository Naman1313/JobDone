import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { content, mediaUrls, trade, location } = body;

    if (!content) {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
    }

    // MediaUrls is coming as an array, we store it as a JSON string
    const mediaUrlsString = mediaUrls && mediaUrls.length > 0 ? JSON.stringify(mediaUrls) : null;

    const post = await prisma.post.create({
      data: {
        authorId: decoded.id,
        content,
        mediaUrls: mediaUrlsString,
        trade,
        location,
      },
      include: {
        author: {
          include: { profile: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Create Post Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
