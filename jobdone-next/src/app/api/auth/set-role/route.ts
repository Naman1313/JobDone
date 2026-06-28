import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    
    // Extract token from header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    } catch (err) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }
    
    const userId = decoded.id;

    if (role !== 'WORKER' && role !== 'CLIENT') {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role }
    });

    // Generate new access token with the role
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, phone: user.phone }, 
      process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key', 
      { expiresIn: '15m' }
    );

    return NextResponse.json({
      success: true,
      accessToken,
      user
    });
  } catch (error) {
    console.error('Set Role Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
