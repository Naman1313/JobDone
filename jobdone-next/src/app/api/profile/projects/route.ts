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

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });

    const projects = await prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: { isFeatured: 'desc' }
    });

    return NextResponse.json({ success: true, data: projects });
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

    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });

    const body = await req.json();
    const { title, description, skillsUsed, techStack, mediaUrls, demoUrl, githubUrl, startDate, endDate, isFeatured } = body;

    if (!title) return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });

    const project = await prisma.project.create({
      data: {
        profileId: profile.id,
        title,
        description,
        skillsUsed: skillsUsed ? JSON.stringify(skillsUsed) : null,
        techStack: techStack ? JSON.stringify(techStack) : null,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        demoUrl,
        githubUrl,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isFeatured: isFeatured || false
      }
    });

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error('Project POST Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
