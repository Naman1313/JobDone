import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    const userId = decoded.id;

    const savedItems = await prisma.savedItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // In a real application, you would populate these dynamically based on itemType
    // For this demo, we'll return the raw items and let the frontend format them
    return NextResponse.json({ success: true, data: savedItems });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    const userId = decoded.id;

    const body = await req.json();
    const { itemType, itemId, collection = 'General' } = body;

    const saved = await prisma.savedItem.create({
      data: {
        userId,
        itemType,
        itemId,
        collection
      }
    });

    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    const userId = decoded.id;

    const body = await req.json();
    const { ids } = body; // Array of IDs for bulk delete

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json({ success: false, message: 'Invalid data' }, { status: 400 });
    }

    await prisma.savedItem.deleteMany({
      where: {
        id: { in: ids },
        userId // Ensure they only delete their own
      }
    });

    return NextResponse.json({ success: true, message: 'Items removed' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
