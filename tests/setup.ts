import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { beforeAll, afterAll, beforeEach } from 'vitest';

// Use in-memory SQLite for tests
process.env.DATABASE_URL = 'file::memory:?cache=shared';

const prisma = new PrismaClient();

beforeAll(async () => {
  // Push schema to in-memory database
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
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
