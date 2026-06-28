import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all'; // all, professionals, jobs, posts

    if (!query) {
      return NextResponse.json({ success: true, data: { users: [], jobs: [], posts: [] } });
    }

    // Try to record search history if authenticated
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
        
        // Save history (fire and forget to not slow down search)
        prisma.searchHistory.create({
          data: {
            userId: decoded.id,
            query: query
          }
        }).catch(console.error);
      } catch (err) {
        // Ignore auth error for public search
      }
    }

    const [users, jobs, posts] = await Promise.all([
      (type === 'all' || type === 'professionals') ? prisma.user.findMany({
        where: {
          role: 'WORKER',
          profile: {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { trades: { contains: query } },
              { skills: { contains: query } }
            ]
          }
        },
        include: { profile: true },
        take: 5
      }) : [],
      
      (type === 'all' || type === 'jobs') ? prisma.job.findMany({
        where: {
          status: 'OPEN',
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { trade: { contains: query } }
          ]
        },
        take: 5
      }) : [],

      (type === 'all' || type === 'posts') ? prisma.post.findMany({
        where: {
          OR: [
            { content: { contains: query } },
            { trade: { contains: query } }
          ]
        },
        include: {
          author: { include: { profile: true } }
        },
        take: 5
      }) : []
    ]);

    return NextResponse.json({
      success: true,
      data: { users, jobs, posts }
    });
  } catch (error) {
    console.error('Search Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
