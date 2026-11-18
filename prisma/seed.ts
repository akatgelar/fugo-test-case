import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || 'admin@fugocreative.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'fugo2026';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Admin Fugo',
      email,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  console.log(`Seeded admin: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
