import { PrismaClient } from '@prisma/client';
import { Patient } from '../types/domain.js';

export class PatientRepository {
  constructor(private prisma: PrismaClient) {}

  async create(name: string): Promise<Patient> {
    return this.prisma.patient.create({
      data: { name },
    });
  }

  async findById(id: string): Promise<Patient | null> {
    return this.prisma.patient.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Patient[]> {
    return this.prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.patient.count({
      where: { id },
    });
    return count > 0;
  }
}
