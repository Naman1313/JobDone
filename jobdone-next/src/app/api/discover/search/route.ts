import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.trim() === '') {
      return NextResponse.json({ jobs: [], professionals: [] }, { status: 200 });
    }

    const searchQuery = q.trim();

    // Search Jobs
    const jobs = await prisma.job.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery } },
          { trade: { contains: searchQuery } },
          { description: { contains: searchQuery } }
        ]
      },
      include: {
        client: {
          include: { profile: true }
        }
      },
      take: 5
    });

    // Search Professionals
    const professionals = await prisma.profile.findMany({
      where: {
        OR: [
          { trades: { contains: searchQuery } },
          { skills: { contains: searchQuery } },
          { firstName: { contains: searchQuery } },
          { lastName: { contains: searchQuery } }
        ]
      },
      include: {
        user: true
      },
      take: 5
    });

    return NextResponse.json({
      jobs,
      professionals
    }, { status: 200 });

  } catch (error) {
    console.error("Error in universal search:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
