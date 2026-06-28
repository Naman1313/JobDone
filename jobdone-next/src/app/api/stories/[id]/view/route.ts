import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params;

    const story = await prisma.story.update({
      where: { id: storyId },
      data: {
        views: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ success: true, views: story.views });
  } catch (error) {
    console.error('View Story Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
