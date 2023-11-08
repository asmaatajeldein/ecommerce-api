import { PrismaClient } from '@prisma/client';

import * as bcrypt from 'bcrypt';

// intialize prisma client
const prisma = new PrismaClient();
const SALT_ROUNDS = process.env.SALT_ROUNDS;

async function main() {
  await prisma.user.deleteMany();

  const superAdminHashedPassword = await bcrypt.hash(
    'superAdminPassword',
    SALT_ROUNDS,
  );
  const createSuperAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@email.com',
      password: superAdminHashedPassword,
      firstName: 'Jane',
      lastName: 'Doe',
      phoneNumber: '111111111',
      birthDate: new Date(2001, 1, 9),
      gender: 'Female',
      role: 'SUPERADMIN',
    },
  });

  const AdminHashedPassword = await bcrypt.hash('adminPassword', SALT_ROUNDS);
  const createAdminUser = await prisma.user.create({
    data: {
      email: 'admin@email.com',
      password: AdminHashedPassword,
      firstName: 'Olivia',
      lastName: 'Doe',
      phoneNumber: '111111111',
      birthDate: new Date(2001, 1, 9),
      gender: 'Female',
      role: 'ADMIN',
    },
  });

  const customerHashedPassword = await bcrypt.hash(
    'customerPassword',
    SALT_ROUNDS,
  );
  const createCustomerUser = await prisma.user.create({
    data: {
      email: 'customer@email.com',
      password: customerHashedPassword,
      firstName: 'Taylor',
      lastName: 'Swift',
      phoneNumber: '111111111',
      birthDate: new Date(2001, 1, 9),
      gender: 'Female',
      role: 'CUSTOMER',
      customer: { create: { stripeCustomerId: '79595klej' } },
    },
  });

  console.log({
    superAdmin: createSuperAdminUser,
    admin: createAdminUser,
    customer: createCustomerUser,
  });
}

// execute the main function
main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    // close prisma client at the end
    await prisma.$disconnect();
  });
