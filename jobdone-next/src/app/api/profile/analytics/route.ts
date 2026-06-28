import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
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

    const userId = decoded.id;
    const url = new URL(req.url);
    const timeframe = url.searchParams.get('timeframe') || '30d'; // e.g. 7d, 30d, 90d

    let dateLimit = new Date();
    if (timeframe === '7d') dateLimit.setDate(dateLimit.getDate() - 7);
    else if (timeframe === '90d') dateLimit.setDate(dateLimit.getDate() - 90);
    else dateLimit.setDate(dateLimit.getDate() - 30); // Default 30d

    const [profileViews, recruiterViews, searchAppearances, jobApplications, followers] = await Promise.all([
      prisma.profileView.count({ where: { userId, createdAt: { gte: dateLimit } } }),
      prisma.profileView.count({ where: { userId, isRecruiter: true, createdAt: { gte: dateLimit } } }),
      prisma.searchAppearance.count({ where: { userId, createdAt: { gte: dateLimit } } }),
      prisma.application.count({ where: { workerId: userId, createdAt: { gte: dateLimit } } }),
      prisma.follow.count({ where: { followingId: userId, createdAt: { gte: dateLimit } } })
    ]);

    // Dummy historical data for charts
    const chartData = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      views: Math.floor(Math.random() * 50) + 10,
      searches: Math.floor(Math.random() * 30) + 5
    }));

    return NextResponse.json({
      success: true,
      data: {
        profileViews,
        recruiterViews,
        searchAppearances,
        jobApplications,
        followers,
        chartData
      }
    });

  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
