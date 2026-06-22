import { PrismaClient } from '@prisma/client';
import { Clinician } from '../types/domain.js';

export class ClinicianRepository {
  constructor(private prisma: PrismaClient) {}

  async create(name: string): Promise<Clinician> {
    return this.prisma.clinician.create({
      data: { name },
    });
  }

  async findById(id: string): Promise<Clinician | null> {
    return this.prisma.clinician.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Clinician[]> {
    return this.prisma.clinician.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.clinician.count({
      where: { id },
    });
    return count > 0;
  }
}
