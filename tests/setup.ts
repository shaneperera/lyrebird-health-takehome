import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';

// Use test database file
process.env.DATABASE_URL = 'file:./test.db';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Push schema to test database
  execSync('npx prisma db push --skip-generate --accept-data-loss', { stdio: 'inherit' });
  await prisma.$connect();
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.appointment.deleteMany();
  await prisma.clinician.deleteMany();
  await prisma.patient.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
