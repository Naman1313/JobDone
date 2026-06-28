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
    const { 
      title, 
      description, 
      trade, 
      budget, 
      budgetType, 
      location, 
      isRemote, 
      deadline, 
      skills, 
      attachments 
    } = body;

    if (!title || !description || !trade) {
      return NextResponse.json({ success: false, message: 'Title, description, and trade are required' }, { status: 400 });
    }

    // Convert arrays to JSON strings for SQLite
    const skillsString = skills && skills.length > 0 ? JSON.stringify(skills) : null;
    const attachmentsString = attachments && attachments.length > 0 ? JSON.stringify(attachments) : null;

    const job = await prisma.job.create({
      data: {
        clientId: decoded.id,
        title,
        description,
        trade,
        budget: budget ? parseFloat(budget) : null,
        budgetType,
        location,
        isRemote: Boolean(isRemote),
        deadline: deadline ? new Date(deadline) : null,
        skills: skillsString,
        attachments: attachmentsString,
        status: "OPEN"
      }
    });

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error('Create Job Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
