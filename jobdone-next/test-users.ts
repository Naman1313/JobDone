import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({
    include: { profile: true }
  });
  console.log(users.map(u => ({ id: u.id, name: u.profile?.firstName + " " + u.profile?.lastName })));
}
main().then(() => prisma.$disconnect());
