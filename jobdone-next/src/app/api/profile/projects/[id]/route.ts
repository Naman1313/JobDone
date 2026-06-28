import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    
    const project = await prisma.project.findUnique({ where: { id: params.id }, include: { profile: true } });
    if (!project || project.profile.userId !== decoded.id) {
      return NextResponse.json({ success: false, message: 'Not found or unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, skillsUsed, techStack, mediaUrls, demoUrl, githubUrl, startDate, endDate, isFeatured } = body;

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : project.title,
        description: description !== undefined ? description : project.description,
        skillsUsed: skillsUsed ? JSON.stringify(skillsUsed) : project.skillsUsed,
        techStack: techStack ? JSON.stringify(techStack) : project.techStack,
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : project.mediaUrls,
        demoUrl: demoUrl !== undefined ? demoUrl : project.demoUrl,
        githubUrl: githubUrl !== undefined ? githubUrl : project.githubUrl,
        startDate: startDate ? new Date(startDate) : project.startDate,
        endDate: endDate ? new Date(endDate) : project.endDate,
        isFeatured: isFeatured !== undefined ? isFeatured : project.isFeatured
      }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'jobdone_access_secret_key');
    
    const project = await prisma.project.findUnique({ where: { id: params.id }, include: { profile: true } });
    if (!project || project.profile.userId !== decoded.id) {
      return NextResponse.json({ success: false, message: 'Not found or unauthorized' }, { status: 403 });
    }

    await prisma.project.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
