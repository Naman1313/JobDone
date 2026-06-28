import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const follows = await prisma.follow.findMany();
  console.log("Total Follows:", follows.length);
  console.log(follows);
}
main().then(() => prisma.$disconnect());
