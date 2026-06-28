import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const verified = searchParams.get('verified') === 'true';
    
    let whereClause: any = {};
    
    if (category) {
      whereClause.OR = [
        { trades: { contains: category } },
        { skills: { contains: category } }
      ];
    }
    
    if (verified) {
      // In a real scenario, verified might be on User model or Profile model.
      // Based on schema, User has isVerified.
      whereClause.user = {
        isVerified: true
      };
    }

    const professionals = await prisma.profile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            isVerified: true,
            role: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      },
      take: 50
    });

    return NextResponse.json(professionals, { status: 200 });
  } catch (error) {
    console.error("Error fetching professionals:", error);
    return NextResponse.json({ error: "Failed to fetch professionals" }, { status: 500 });
  }
}
