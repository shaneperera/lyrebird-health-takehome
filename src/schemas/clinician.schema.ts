import { z } from 'zod';

export const createClinicianSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export const clinicianResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateClinicianDTO = z.infer<typeof createClinicianSchema>;
export type ClinicianResponseDTO = z.infer<typeof clinicianResponseSchema>;
