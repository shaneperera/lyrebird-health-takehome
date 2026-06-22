import { ClinicianRepository } from '../repositories/clinician.repository.js';
import { Clinician } from '../types/domain.js';
import { CreateClinicianDTO } from '../schemas/clinician.schema.js';

export class ClinicianService {
  constructor(private clinicianRepo: ClinicianRepository) {}

  async createClinician(dto: CreateClinicianDTO): Promise<Clinician> {
    return this.clinicianRepo.create(dto.name);
  }

  async getAllClinicians(): Promise<Clinician[]> {
    return this.clinicianRepo.findAll();
  }
}
