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
    let followingIds: string[] = [];
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
        userId = decoded.id;
        
        const followingList = await prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true }
        });
        followingIds = followingList.map(f => f.followingId);
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

    const groupedArray = Object.values(groupedStories);

    // Sort: Self first, then Following, then others (by most recent story)
    groupedArray.sort((a: any, b: any) => {
      if (userId) {
        const isSelfA = a.author.id === userId;
        const isSelfB = b.author.id === userId;
        if (isSelfA && !isSelfB) return -1;
        if (!isSelfA && isSelfB) return 1;

        const isFollowingA = followingIds.includes(a.author.id);
        const isFollowingB = followingIds.includes(b.author.id);
        if (isFollowingA && !isFollowingB) return -1;
        if (!isFollowingA && isFollowingB) return 1;
      }

      const latestA = Math.max(...a.stories.map((s:any) => new Date(s.createdAt).getTime()));
      const latestB = Math.max(...b.stories.map((s:any) => new Date(s.createdAt).getTime()));
      return latestB - latestA;
    });

    return NextResponse.json({ 
      success: true, 
      data: groupedArray 
    });
  } catch (error) {
    console.error('Get Stories Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
