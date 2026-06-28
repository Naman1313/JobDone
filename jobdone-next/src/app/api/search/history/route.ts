import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ success: true, data: [] });
    }
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    } catch (err) {
      return NextResponse.json({ success: true, data: [] });
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId: decoded.id },
      orderBy: { createdAt: 'desc' },
      distinct: ['query'],
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: history.map(h => h.query)
    });
  } catch (error) {
    console.error('Search History Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
