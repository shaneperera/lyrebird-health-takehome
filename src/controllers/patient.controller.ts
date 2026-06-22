import { Request, Response } from 'express';
import { PatientService } from '../services/patient.service.js';
import { formatISO } from 'date-fns';

export class PatientController {
  constructor(private patientService: PatientService) {}

  createPatient = async (req: Request, res: Response) => {
    const patient = await this.patientService.createPatient(req.body);

    res.status(201).json({
      id: patient.id,
      name: patient.name,
      createdAt: formatISO(patient.createdAt),
      updatedAt: formatISO(patient.updatedAt),
    });
  };

  getAllPatients = async (req: Request, res: Response) => {
    const patients = await this.patientService.getAllPatients();

    res.json(
      patients.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: formatISO(p.createdAt),
        updatedAt: formatISO(p.updatedAt),
      }))
    );
  };
}
