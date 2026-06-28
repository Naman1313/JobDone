import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET comments for a post
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const postId = resolvedParams.id;
    const comments = await prisma.comment.findMany({
      where: { postId, parentId: null }, // Top level comments
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: { profile: true }
        },
        replies: {
          include: {
            author: { include: { profile: true } }
          }
        }
      }
    });

    const formattedComments = comments.map(c => ({
      _id: c.id,
      content: c.content,
      createdAt: c.createdAt.toISOString(),
      author: {
        _id: c.author.id,
        name: c.author.profile?.firstName ? `${c.author.profile.firstName} ${c.author.profile.lastName || ''}` : 'Unknown',
        profilePhoto: c.author.profile?.avatarUrl,
      },
      replies: c.replies.map(r => ({
        _id: r.id,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
        author: {
          _id: r.author.id,
          name: r.author.profile?.firstName ? `${r.author.profile.firstName} ${r.author.profile.lastName || ''}` : 'Unknown',
          profilePhoto: r.author.profile?.avatarUrl,
        }
      }))
    }));

    return NextResponse.json({ success: true, data: formattedComments });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// POST a new comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const session = getCurrentUser(req);
    if (!session?.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { content, parentId } = await req.json();
    if (!content) {
      return NextResponse.json({ success: false, message: 'Content is required' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        postId: resolvedParams.id,
        authorId: session.id,
        content,
        parentId: parentId || null
      },
      include: {
        author: { include: { profile: true } }
      }
    });

    const formatted = {
      _id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        _id: comment.author.id,
        name: comment.author.profile?.firstName ? `${comment.author.profile.firstName} ${comment.author.profile.lastName || ''}` : 'Unknown',
        profilePhoto: comment.author.profile?.avatarUrl,
      },
      replies: []
    };

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error' }, { status: 500 });
  }
}
