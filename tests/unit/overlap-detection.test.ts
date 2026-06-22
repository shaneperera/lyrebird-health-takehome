import { describe, it, expect, beforeEach } from 'vitest';
import { AppointmentRepository } from '../../src/repositories/appointment.repository.js';
import { ClinicianRepository } from '../../src/repositories/clinician.repository.js';
import { PatientRepository } from '../../src/repositories/patient.repository.js';
import { prisma } from '../setup.js';

describe('Overlap Detection', () => {
  let appointmentRepo: AppointmentRepository;
  let clinicianRepo: ClinicianRepository;
  let patientRepo: PatientRepository;
  let clinicianId: string;
  let patientId: string;

  beforeEach(async () => {
    appointmentRepo = new AppointmentRepository(prisma);
    clinicianRepo = new ClinicianRepository(prisma);
    patientRepo = new PatientRepository(prisma);

    const clinician = await clinicianRepo.create('Dr. Smith');
    const patient = await patientRepo.create('John Doe');
    clinicianId = clinician.id;
    patientId = patient.id;
  });

  it('should allow non-overlapping appointments', async () => {
    // First appointment: 10:00 - 11:00
    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T11:00:00Z')
    );

    // Second appointment: 12:00 - 13:00 (completely separate)
    const appointment2 = await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T12:00:00Z'),
      new Date('2024-01-01T13:00:00Z')
    );

    expect(appointment2).toBeDefined();
    expect(appointment2.id).toBeDefined();
  });

  it('should allow touching appointments (end === other.start)', async () => {
    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T11:00:00Z')
    );

    // Second appointment: 11:00 - 12:00 (touching but not overlapping)
    const appointment2 = await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T11:00:00Z'),
      new Date('2024-01-01T12:00:00Z')
    );

    expect(appointment2).toBeDefined();
  });

  it('should reject overlapping appointments (start time overlap)', async () => {
    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T11:00:00Z')
    );

    await expect(
      appointmentRepo.createWithOverlapCheck(
        clinicianId,
        patientId,
        new Date('2024-01-01T10:30:00Z'),
        new Date('2024-01-01T11:30:00Z')
      )
    ).rejects.toThrow('OVERLAP_DETECTED');
  });

  it('should reject overlapping appointments (end time overlap)', async () => {
    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T11:00:00Z')
    );

    await expect(
      appointmentRepo.createWithOverlapCheck(
        clinicianId,
        patientId,
        new Date('2024-01-01T09:30:00Z'),
        new Date('2024-01-01T10:30:00Z')
      )
    ).rejects.toThrow('OVERLAP_DETECTED');
  });

  it('should reject appointments fully contained within another', async () => {
    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T12:00:00Z')
    );

    await expect(
      appointmentRepo.createWithOverlapCheck(
        clinicianId,
        patientId,
        new Date('2024-01-01T10:30:00Z'),
        new Date('2024-01-01T11:30:00Z')
      )
    ).rejects.toThrow('OVERLAP_DETECTED');
  });

  it('should reject appointments that fully contain another', async () => {
    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:30:00Z'),
      new Date('2024-01-01T11:30:00Z')
    );

    await expect(
      appointmentRepo.createWithOverlapCheck(
        clinicianId,
        patientId,
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T12:00:00Z')
      )
    ).rejects.toThrow('OVERLAP_DETECTED');
  });

  it('should allow same-time appointments for different clinicians', async () => {
    const clinician2 = await clinicianRepo.create('Dr. Jones');

    await appointmentRepo.createWithOverlapCheck(
      clinicianId,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T11:00:00Z')
    );

    const appointment2 = await appointmentRepo.createWithOverlapCheck(
      clinician2.id,
      patientId,
      new Date('2024-01-01T10:00:00Z'),
      new Date('2024-01-01T11:00:00Z')
    );

    expect(appointment2).toBeDefined();
  });
});
