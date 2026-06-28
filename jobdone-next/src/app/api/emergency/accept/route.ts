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

    const body = await req.json();
    const { emergencyId } = body;

    if (!emergencyId) {
      return NextResponse.json({ success: false, message: 'Emergency ID is required' }, { status: 400 });
    }

    // Attempt to update the emergency request if it's still SEARCHING
    const updated = await prisma.emergencyRequest.update({
      where: {
        id: emergencyId,
        status: 'SEARCHING' // Ensure it hasn't been accepted by someone else already
      },
      data: {
        status: 'ACCEPTED',
        responderId: decoded.id
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.code === 'P2025') {
       return NextResponse.json({ success: false, message: 'Emergency request not found or already accepted' }, { status: 404 });
    }
    console.error('Emergency Accept Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
