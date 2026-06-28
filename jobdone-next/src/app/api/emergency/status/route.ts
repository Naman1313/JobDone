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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    const emergency = await prisma.emergencyRequest.findUnique({
      where: { id },
      include: {
        responder: {
          include: { profile: true }
        }
      }
    });

    if (!emergency) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    // Quick mock for demonstration:
    // If it's been SEARCHING for more than 10 seconds, auto-accept it with a mock responder!
    // This allows the user to see the "Responder Found" state without another device.
    if (emergency.status === 'SEARCHING') {
      const secondsSince = (new Date().getTime() - emergency.createdAt.getTime()) / 1000;
      if (secondsSince > 5) {
        // Find any user to be responder
        const potentialResponder = await prisma.user.findFirst({
          where: { id: { not: decoded.id } }
        });
        
        if (potentialResponder) {
          const updated = await prisma.emergencyRequest.update({
            where: { id },
            data: { 
              status: 'ACCEPTED',
              responderId: potentialResponder.id
            },
            include: {
              responder: { include: { profile: true } }
            }
          });
          return NextResponse.json({ success: true, data: updated });
        }
      }
    }

    return NextResponse.json({ success: true, data: emergency });
  } catch (error) {
    console.error('Emergency Status Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
