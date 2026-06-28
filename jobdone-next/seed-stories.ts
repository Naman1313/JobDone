import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ include: { profile: true } });
  
  // Find Arjun and Rahul
  const arjuns = users.filter(u => u.profile?.firstName === 'Arjun');
  const rahuls = users.filter(u => u.profile?.firstName === 'Rahul');
  
  const targetUsers = [...arjuns, ...rahuls];
  
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const storyOptions = [
    { url: 'https://images.unsplash.com/photo-1541888081514-0e319bfaf548?w=800&q=80', caption: 'Working hard today! 💪' },
    { url: 'https://images.unsplash.com/photo-1504307651254-35680f356f58?w=800&q=80', caption: 'Site inspection completed! ✅' },
    { url: 'https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?w=800&q=80', caption: 'New project started! 🏗️' },
    { url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80', caption: 'Safety first always. 🦺' }
  ];

  let i = 0;
  for (const user of targetUsers) {
    const opt = storyOptions[i % storyOptions.length];
    await prisma.story.create({
      data: {
        authorId: user.id,
        mediaUrl: opt.url,
        mediaType: 'IMAGE',
        caption: opt.caption,
        expiresAt: expiresAt
      }
    });
    console.log(`Created story for ${user.profile?.firstName} ${user.profile?.lastName} with caption: ${opt.caption}`);
    i++;
  }
}
main().then(() => prisma.$disconnect());
