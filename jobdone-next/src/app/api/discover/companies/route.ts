import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const verified = searchParams.get('verified') === 'true';
    
    let whereClause: any = {};
    if (industry) {
      whereClause.industry = { contains: industry };
    }
    if (verified) {
      whereClause.isVerified = true;
    }

    const companies = await prisma.company.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json(companies, { status: 200 });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
