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

    const { mediaUrl, mediaType, caption } = await req.json();

    if (!mediaUrl) {
      return NextResponse.json({ success: false, message: 'Media URL is required' }, { status: 400 });
    }

    // Set expiration to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const story = await prisma.story.create({
      data: {
        authorId: decoded.id,
        mediaUrl,
        mediaType: mediaType || 'IMAGE',
        caption,
        expiresAt
      },
      include: {
        author: {
          include: { profile: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: story });
  } catch (error) {
    console.error('Create Story Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    let userId: string | null = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
        userId = decoded.id;
      } catch (err) {
        // Continue even if unauthorized to show public stories if needed, though usually stories require auth
      }
    }

    // Fetch active stories (expiresAt > now)
    const activeStories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        author: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            }
          }
        },
        reactions: {
          where: userId ? { userId } : undefined
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group stories by author to match Instagram format
    const groupedStories = activeStories.reduce((acc, story) => {
      const authorId = story.authorId;
      if (!acc[authorId]) {
        acc[authorId] = {
          author: story.author,
          stories: []
        };
      }
      acc[authorId].stories.push(story);
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({ 
      success: true, 
      data: Object.values(groupedStories) 
    });
  } catch (error) {
    console.error('Get Stories Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
