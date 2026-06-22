import { Request, Response } from 'express';
import { ClinicianService } from '../services/clinician.service.js';
import { formatISO } from 'date-fns';

export class ClinicianController {
  constructor(private clinicianService: ClinicianService) {}

  createClinician = async (req: Request, res: Response) => {
    const clinician = await this.clinicianService.createClinician(req.body);

    res.status(201).json({
      id: clinician.id,
      name: clinician.name,
      createdAt: formatISO(clinician.createdAt),
      updatedAt: formatISO(clinician.updatedAt),
    });
  };

  getAllClinicians = async (req: Request, res: Response) => {
    const clinicians = await this.clinicianService.getAllClinicians();

    res.json(
      clinicians.map((c) => ({
        id: c.id,
        name: c.name,
        createdAt: formatISO(c.createdAt),
        updatedAt: formatISO(c.updatedAt),
      }))
    );
  };
}
