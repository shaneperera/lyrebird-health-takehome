import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { authenticateRole, requireRole } from '../middleware/auth.middleware.js';
import { createAppointmentSchema, appointmentQuerySchema } from '../schemas/appointment.schema.js';
import { UserRole } from '../types/domain.js';

export const createAppointmentRoutes = (controller: AppointmentController) => {
  const router = Router();

  router.post(
    '/',
    authenticateRole,
    requireRole(UserRole.PATIENT, UserRole.ADMIN),
    validateBody(createAppointmentSchema),
    asyncHandler(controller.createAppointment)
  );

  router.get(
    '/',
    authenticateRole,
    requireRole(UserRole.ADMIN),
    validateQuery(appointmentQuerySchema),
    asyncHandler(controller.getAllAppointments)
  );

  return router;
};
