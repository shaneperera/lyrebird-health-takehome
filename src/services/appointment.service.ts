import { parseISO, isFuture } from 'date-fns';
import { AppointmentRepository } from '../repositories/appointment.repository.js';
import { ClinicianRepository } from '../repositories/clinician.repository.js';
import { PatientRepository } from '../repositories/patient.repository.js';
import { AppointmentWithRelations, AppointmentFilters } from '../types/domain.js';
import { ConflictError, NotFoundError, ValidationError } from '../types/errors.js';
import { CreateAppointmentDTO } from '../schemas/appointment.schema.js';

export class AppointmentService {
  constructor(
    private appointmentRepo: AppointmentRepository,
    private clinicianRepo: ClinicianRepository,
    private patientRepo: PatientRepository
  ) {}

  async createAppointment(dto: CreateAppointmentDTO): Promise<AppointmentWithRelations> {
    const startTime = parseISO(dto.startTime);
    const endTime = parseISO(dto.endTime);

    // Business rule: No appointments in the past
    if (!isFuture(startTime)) {
      throw new ValidationError('Cannot create appointments in the past');
    }

    // Verify clinician exists
    const clinicianExists = await this.clinicianRepo.exists(dto.clinicianId);
    if (!clinicianExists) {
      throw new NotFoundError('Clinician', dto.clinicianId);
    }

    // Verify patient exists
    const patientExists = await this.patientRepo.exists(dto.patientId);
    if (!patientExists) {
      throw new NotFoundError('Patient', dto.patientId);
    }

    // Create appointment with overlap check (in SERIALIZABLE transaction)
    try {
      return await this.appointmentRepo.createWithOverlapCheck(
        dto.clinicianId,
        dto.patientId,
        startTime,
        endTime
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'OVERLAP_DETECTED') {
        throw new ConflictError(
          'Appointment overlaps with existing appointment for this clinician'
        );
      }
      throw error;
    }
  }

  async getClinicianAppointments(
    clinicianId: string,
    filters?: { from?: string; to?: string }
  ): Promise<AppointmentWithRelations[]> {
    // Verify clinician exists
    const clinicianExists = await this.clinicianRepo.exists(clinicianId);
    if (!clinicianExists) {
      throw new NotFoundError('Clinician', clinicianId);
    }

    const parsedFilters: AppointmentFilters = {};
    if (filters?.from) {
      parsedFilters.from = parseISO(filters.from);
    }
    if (filters?.to) {
      parsedFilters.to = parseISO(filters.to);
    }

    return this.appointmentRepo.findUpcomingByClinicianId(clinicianId, parsedFilters);
  }

  async getAllUpcomingAppointments(filters?: {
    from?: string;
    to?: string;
  }): Promise<AppointmentWithRelations[]> {
    const parsedFilters: AppointmentFilters = {};
    if (filters?.from) {
      parsedFilters.from = parseISO(filters.from);
    }
    if (filters?.to) {
      parsedFilters.to = parseISO(filters.to);
    }

    return this.appointmentRepo.findAllUpcoming(parsedFilters);
  }
}
