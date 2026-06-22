import { z } from 'zod';
import { isValid, parseISO, isBefore } from 'date-fns';

// Custom validator for ISO 8601 datetime strings
const isoDateTimeString = z.string().refine(
  (val) => {
    try {
      const date = parseISO(val);
      return isValid(date);
    } catch {
      return false;
    }
  },
  { message: 'Invalid ISO 8601 datetime format' }
);

export const createAppointmentSchema = z
  .object({
    clinicianId: z.string().uuid('Invalid clinician ID'),
    patientId: z.string().uuid('Invalid patient ID'),
    startTime: isoDateTimeString,
    endTime: isoDateTimeString,
  })
  .refine(
    (data) => {
      const start = parseISO(data.startTime);
      const end = parseISO(data.endTime);
      return isBefore(start, end);
    },
    {
      message: 'startTime must be before endTime',
      path: ['startTime'],
    }
  );

export const appointmentQuerySchema = z.object({
  from: isoDateTimeString.optional(),
  to: isoDateTimeString.optional(),
});

export const appointmentResponseSchema = z.object({
  id: z.string().uuid(),
  clinicianId: z.string().uuid(),
  patientId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  clinician: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
  patient: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});

export type CreateAppointmentDTO = z.infer<typeof createAppointmentSchema>;
export type AppointmentQueryDTO = z.infer<typeof appointmentQuerySchema>;
export type AppointmentResponseDTO = z.infer<typeof appointmentResponseSchema>;
