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

    const userId = decoded.id;
    
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { projects: true }
    });

    if (!profile) {
      return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
    }

    // Calculate Completion
    let score = 0;
    const recommendations = [];

    if (profile.avatarUrl) {
      score += 10;
    } else {
      recommendations.push("Upload a profile photo to stand out.");
    }

    if (profile.bio && profile.bio.length > 10) {
      score += 20;
    } else {
      recommendations.push("Add a bio to tell others about yourself.");
    }

    if (profile.skills && JSON.parse(profile.skills).length > 0) {
      score += 20;
    } else {
      recommendations.push("Add your skills to show your expertise.");
    }

    if (profile.projects && profile.projects.length > 0) {
      score += 20;
    } else {
      recommendations.push("Add a project to showcase your past work.");
    }

    if (profile.location) {
      score += 10;
    } else {
      recommendations.push("Add your location to find nearby jobs.");
    }

    if (profile.resumeUrl) {
      score += 20;
    } else {
      recommendations.push("Upload your resume for recruiters to see.");
    }

    // Update the DB if it changed
    if (score !== profile.completionScore) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { completionScore: score }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        score,
        recommendations
      }
    });

  } catch (error) {
    console.error('Completion Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
