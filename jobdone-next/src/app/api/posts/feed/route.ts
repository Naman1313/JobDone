import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'All';
    const cursor = searchParams.get('cursor');
    const clientLat = searchParams.get('lat');
    const clientLon = searchParams.get('lon');
    const limit = 10;
    
    // Auth Check
    const session = getCurrentUser(request);
    let userId = session?.id || null;
    let userLat: number | null = clientLat ? parseFloat(clientLat) : null;
    let userLon: number | null = clientLon ? parseFloat(clientLon) : null;

    if (!userLat || !userLon) {
      if (userId) {
        const userProfile = await prisma.profile.findUnique({
          where: { userId },
          select: { latitude: true, longitude: true }
        });
        // Use profile coordinates if available, otherwise fallback to a default location (e.g., Central Delhi) so the user can see the feature working
        userLat = userProfile?.latitude || 28.6139;
        userLon = userProfile?.longitude || 77.2090;
      } else {
        // If not logged in, use a default fallback
        userLat = 28.6139;
        userLon = 77.2090;
      }
    }

    let whereClause: any = {};
    let orderByClause: any = { createdAt: 'desc' };

    switch (filter) {
      case 'Following':
        if (!userId) return NextResponse.json({ success: true, data: [] });
        const following = await prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true }
        });
        const followingIds = following.map(f => f.followingId);
        whereClause = { authorId: { in: followingIds } };
        break;
        
      case 'Nearby':
        // For nearby, ideally use geospatial bounding boxes. Here we mock logic for nearby.
        // In reality, this requires Post/User location coordinates.
        whereClause = { location: { not: null } }; // Only show posts with locations
        break;
        
      case 'By Trade':
        if (userId) {
          const profile = await prisma.profile.findUnique({ where: { userId } });
          if (profile?.trades) {
            const trades = JSON.parse(profile.trades);
            whereClause = { trade: { in: trades } };
          }
        }
        break;

      case 'Trending':
        // Custom sorting is handled after the database fetch for Trending
        break;

      case 'AI Picks':
        // Complex AI logic simulated: High likes, matched trade, near location
        if (userId) {
          const profile = await prisma.profile.findUnique({ where: { userId } });
          let trades = [];
          if (profile?.trades) {
             try { trades = JSON.parse(profile.trades); } catch {}
          }
          whereClause = {
            OR: [
              { trade: { in: trades } },
              { authorId: userId } // Include own posts
            ]
          };
          orderByClause = { views: 'desc' }; // Assume high views = AI recommended
        }
        break;
        
      case 'All':
      default:
        // No strict where clause, just recent posts
        break;
    }

    // Pre-fetch following list if logged in to calculate isFollowing flag
    let userFollowingIds = new Set<string>();
    if (userId) {
      const followingList = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      });
      userFollowingIds = new Set(followingList.map(f => f.followingId));
    }

    let posts = [];
    let nextCursor: string | undefined = undefined;

    if (filter === 'Trending') {
      // 1. Fetch recent posts to determine trending based on engagement
      const recentPosts = await prisma.post.findMany({
        where: whereClause,
        take: 100, // Fetch up to 100 recent candidates to sort
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { id: true, profile: true, isVerified: true } },
          likes: true,
          comments: true,
        }
      });

      // 2. Sort by total human engagement (likes + comments + shares)
      recentPosts.sort((a, b) => {
        const scoreA = a.likes.length + a.comments.length + (a.shares || 0);
        const scoreB = b.likes.length + b.comments.length + (b.shares || 0);
        if (scoreB === scoreA) return b.createdAt.getTime() - a.createdAt.getTime();
        return scoreB - scoreA;
      });

      // 3. Manual cursor pagination
      let startIndex = 0;
      if (cursor) {
        const index = recentPosts.findIndex(p => p.id === cursor);
        if (index !== -1) startIndex = index + 1; // +1 to skip the cursor itself
      }
      posts = recentPosts.slice(startIndex, startIndex + limit + 1);

      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }
    } else {
      // Standard database pagination for other tabs
      posts = await prisma.post.findMany({
        where: whereClause,
        take: limit + 1,
        skip: cursor ? 1 : 0, // IMPORTANT: skip the cursor item
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: orderByClause,
        include: {
          author: { select: { id: true, profile: true, isVerified: true } },
          likes: true,
          comments: true,
        }
      });
      
      if (posts.length > limit) {
        const nextItem = posts.pop();
        nextCursor = nextItem!.id;
      }
    }

    // Helper function to calculate distance in km using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Transform for frontend consumption
    const formattedPosts = posts.map(post => {
      let distanceKm: number | undefined = undefined;
      if (userLat !== null && userLon !== null && post.latitude !== null && post.longitude !== null) {
        distanceKm = Math.round(calculateDistance(userLat, userLon, post.latitude, post.longitude) * 10) / 10;
      }
      
      return {
      _id: post.id,
      content: post.content,
      mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      trade: post.trade || "General",
      location: post.location || "Unknown",
      distanceKm,
      likes: post.likes.map(l => l.userId),
      createdAt: post.createdAt.toISOString(),
      views: post.views,
      shares: post.shares,
      authorId: {
        _id: post.author.id,
        name: post.author.profile?.firstName ? `${post.author.profile.firstName} ${post.author.profile.lastName || ''}` : "Unknown User",
        profilePhoto: post.author.profile?.avatarUrl,
        isVerified: post.author.isVerified,
        isFollowing: userFollowingIds.has(post.author.id),
      }
    };
  });
    
    return NextResponse.json({
      success: true,
      data: formattedPosts,
      nextCursor
    });
  } catch (error) {
    console.error("Feed Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch feed' }, { status: 500 });
  }
}
