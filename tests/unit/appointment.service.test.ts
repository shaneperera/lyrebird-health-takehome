import { describe, it, expect, beforeEach } from 'vitest';
import { AppointmentService } from '../../src/services/appointment.service.js';
import { AppointmentRepository } from '../../src/repositories/appointment.repository.js';
import { ClinicianRepository } from '../../src/repositories/clinician.repository.js';
import { PatientRepository } from '../../src/repositories/patient.repository.js';
import { ValidationError, NotFoundError } from '../../src/types/errors.js';
import { prisma } from '../setup.js';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let clinicianId: string;
  let patientId: string;

  beforeEach(async () => {
    const appointmentRepo = new AppointmentRepository(prisma);
    const clinicianRepo = new ClinicianRepository(prisma);
    const patientRepo = new PatientRepository(prisma);

    service = new AppointmentService(appointmentRepo, clinicianRepo, patientRepo);

    const clinician = await clinicianRepo.create('Dr. Smith');
    const patient = await patientRepo.create('John Doe');
    clinicianId = clinician.id;
    patientId = patient.id;
  });

  it('should reject appointments in the past', async () => {
    const pastDate = new Date('2020-01-01T10:00:00Z');

    await expect(
      service.createAppointment({
        clinicianId,
        patientId,
        startTime: pastDate.toISOString(),
        endTime: new Date('2020-01-01T11:00:00Z').toISOString(),
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should reject appointment with non-existent clinician', async () => {
    const futureDate = new Date(Date.now() + 86400000);

    await expect(
      service.createAppointment({
        clinicianId: '00000000-0000-0000-0000-000000000000',
        patientId,
        startTime: futureDate.toISOString(),
        endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should reject appointment with non-existent patient', async () => {
    const futureDate = new Date(Date.now() + 86400000);

    await expect(
      service.createAppointment({
        clinicianId,
        patientId: '00000000-0000-0000-0000-000000000000',
        startTime: futureDate.toISOString(),
        endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
      })
    ).rejects.toThrow(NotFoundError);
  });

  it('should create valid appointment successfully', async () => {
    const futureDate = new Date(Date.now() + 86400000);

    const appointment = await service.createAppointment({
      clinicianId,
      patientId,
      startTime: futureDate.toISOString(),
      endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
    });

    expect(appointment.id).toBeDefined();
    expect(appointment.clinicianId).toBe(clinicianId);
    expect(appointment.patientId).toBe(patientId);
  });
});
