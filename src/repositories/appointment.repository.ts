import { PrismaClient, Prisma } from '@prisma/client';
import { AppointmentWithRelations, AppointmentFilters } from '../types/domain.js';

export class AppointmentRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * CRITICAL: Create appointment with overlap check in SERIALIZABLE transaction
   * This prevents race conditions where two concurrent requests could both see
   * no overlap and create conflicting appointments.
   */
  async createWithOverlapCheck(
    clinicianId: string,
    patientId: string,
    startTime: Date,
    endTime: Date
  ): Promise<AppointmentWithRelations> {
    return this.prisma.$transaction(
      async (tx) => {
        // Step 1: Check for overlapping appointments
        // Overlap condition: start < other.end AND end > other.start
        // Note: Touching endpoints (end === other.start) is explicitly allowed
        const overlapping = await tx.appointment.findFirst({
          where: {
            clinicianId,
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
        });

        if (overlapping) {
          throw new Error('OVERLAP_DETECTED');
        }

        // Step 2: Create the appointment
        const appointment = await tx.appointment.create({
          data: {
            clinicianId,
            patientId,
            startTime,
            endTime,
          },
          include: {
            clinician: true,
            patient: true,
          },
        });

        return appointment;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      }
    );
  }

  async findUpcomingByClinicianId(
    clinicianId: string,
    filters?: AppointmentFilters
  ): Promise<AppointmentWithRelations[]> {
    const now = new Date();

    const whereClause: Prisma.AppointmentWhereInput = {
      clinicianId,
      endTime: { gte: filters?.from || now },
    };

    if (filters?.to) {
      whereClause.startTime = { lte: filters.to };
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        clinician: true,
        patient: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findAllUpcoming(filters?: AppointmentFilters): Promise<AppointmentWithRelations[]> {
    const now = new Date();

    const whereClause: Prisma.AppointmentWhereInput = {
      endTime: { gte: filters?.from || now },
    };

    if (filters?.to) {
      whereClause.startTime = { lte: filters.to };
    }

    return this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        clinician: true,
        patient: true,
      },
      orderBy: [{ startTime: 'asc' }, { clinicianId: 'asc' }],
    });
  }
}
