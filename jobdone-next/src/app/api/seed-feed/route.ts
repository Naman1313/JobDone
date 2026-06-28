import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Create Mock Users
    const u1 = await prisma.user.create({
      data: {
        email: 'electrician@mock.com',
        isVerified: true,
        profile: {
          create: {
            firstName: 'Arjun',
            lastName: 'Sharma',
            trades: JSON.stringify(['Electrician']),
            location: 'New Delhi',
            avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg'
          }
        }
      }
    });

    const u2 = await prisma.user.create({
      data: {
        email: 'plumber@mock.com',
        isVerified: true,
        profile: {
          create: {
            firstName: 'Rahul',
            lastName: 'Verma',
            trades: JSON.stringify(['Plumber']),
            location: 'Gurugram',
            avatarUrl: 'https://randomuser.me/api/portraits/men/44.jpg'
          }
        }
      }
    });

    // 2. Create Communities
    const comm1 = await prisma.community.create({
      data: { name: 'Delhi Electricians Hub', trade: 'Electrician' }
    });

    // 3. Create Posts
    await prisma.post.create({
      data: {
        content: 'Just finished a huge smart home wiring project in South Delhi! 💡',
        authorId: u1.id,
        trade: 'Electrician',
        location: 'South Delhi',
        views: 120,
        shares: 5,
        mediaUrls: JSON.stringify(['https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop']),
      }
    });

    await prisma.post.create({
      data: {
        content: 'Need advice on fixing a high-pressure commercial water line. Any tips? 🔧',
        authorId: u2.id,
        trade: 'Plumber',
        location: 'Gurugram',
        views: 45,
      }
    });

    // 4. Create Trending Post (High likes simulated)
    const p3 = await prisma.post.create({
      data: {
        content: 'Happy Diwali to all hardworking tradesmen across the country! Stay safe! ✨',
        authorId: u1.id,
        views: 1500,
        communityId: comm1.id
      }
    });
    
    // Add fake likes
    await prisma.like.create({ data: { postId: p3.id, userId: u2.id }});

    return NextResponse.json({ success: true, message: 'Seeded Feed Data' });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: 'Failed to seed' }, { status: 500 });
  }
}
