import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    const userId = decoded.id;

    // Fetch Followers
    const followersData = await prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { include: { profile: true } } }
    });

    // Fetch Following
    const followingData = await prisma.follow.findMany({
      where: { followerId: userId },
      include: { following: { include: { profile: true } } }
    });

    const followers = followersData.map(f => f.follower);
    const following = followingData.map(f => f.following);

    // Mutual Connections (People who follow each other)
    const followingIds = new Set(following.map(f => f.id));
    const mutuals = followers.filter(f => followingIds.has(f.id));

    // Suggestions (People you are not following, maybe popular users)
    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: [userId, ...Array.from(followingIds)] }
      },
      take: 10,
      include: { profile: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        followersCount: followers.length,
        followingCount: following.length,
        mutualCount: mutuals.length,
        followers,
        following,
        mutuals,
        suggestions
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
