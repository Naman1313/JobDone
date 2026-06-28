import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id: postId } = params;

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findFirst({
      where: { userId, postId }
    });

    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ success: true, message: 'Unsaved post' });
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: { userId, postId }
      });
      return NextResponse.json({ success: true, message: 'Saved post' });
    }
  } catch (error) {
    console.error("Save API Error:", error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
