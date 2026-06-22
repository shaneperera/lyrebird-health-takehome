import { PatientRepository } from '../repositories/patient.repository.js';
import { Patient } from '../types/domain.js';
import { CreatePatientDTO } from '../schemas/patient.schema.js';

export class PatientService {
  constructor(private patientRepo: PatientRepository) {}

  async createPatient(dto: CreatePatientDTO): Promise<Patient> {
    return this.patientRepo.create(dto.name);
  }

  async getAllPatients(): Promise<Patient[]> {
    return this.patientRepo.findAll();
  }
}
