import { z } from 'zod';

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export const patientResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreatePatientDTO = z.infer<typeof createPatientSchema>;
export type PatientResponseDTO = z.infer<typeof patientResponseSchema>;
