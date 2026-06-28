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
    const { latitude, longitude, tradeNeeded } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ success: false, message: 'Location is required for emergency' }, { status: 400 });
    }

    // Cancel any existing pending emergency requests for this user
    await prisma.emergencyRequest.updateMany({
      where: { requesterId: decoded.id, status: 'SEARCHING' },
      data: { status: 'CANCELLED' }
    });

    const emergency = await prisma.emergencyRequest.create({
      data: {
        requesterId: decoded.id,
        latitude,
        longitude,
        tradeNeeded,
        status: 'SEARCHING'
      }
    });

    return NextResponse.json({ success: true, data: emergency });
  } catch (error) {
    console.error('Emergency SOS Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
