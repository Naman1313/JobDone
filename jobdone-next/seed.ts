import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Create Mock Users
    const u1 = await prisma.user.create({
      data: {
        email: `electrician${Date.now()}@mock.com`,
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
        email: `plumber${Date.now()}@mock.com`,
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
        latitude: 28.5245,
        longitude: 77.1855,
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
        latitude: 28.4595,
        longitude: 77.0266,
        views: 45,
      }
    });

    const p3 = await prisma.post.create({
      data: {
        content: 'Happy Diwali to all hardworking tradesmen across the country! Stay safe! ✨',
        authorId: u1.id,
        trade: 'General',
        location: 'Connaught Place, Delhi',
        latitude: 28.6304,
        longitude: 77.2177,
        views: 1500,
        communityId: comm1.id
      }
    });
    
    await prisma.like.create({ data: { postId: p3.id, userId: u2.id }});

    console.log("Seeding complete");
  } catch (error) {
    console.error("Seed error:", error);
  }
}
main();
