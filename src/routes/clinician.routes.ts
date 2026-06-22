import { Router } from 'express';
import { ClinicianController } from '../controllers/clinician.controller.js';
import { AppointmentController } from '../controllers/appointment.controller.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import { validateBody, validateQuery } from '../middleware/validation.middleware.js';
import { authenticateRole, requireRole } from '../middleware/auth.middleware.js';
import { createClinicianSchema } from '../schemas/clinician.schema.js';
import { appointmentQuerySchema } from '../schemas/appointment.schema.js';
import { UserRole } from '../types/domain.js';

export const createClinicianRoutes = (
  clinicianController: ClinicianController,
  appointmentController: AppointmentController
) => {
  const router = Router();

  router.post(
    '/',
    authenticateRole,
    requireRole(UserRole.ADMIN),
    validateBody(createClinicianSchema),
    asyncHandler(clinicianController.createClinician)
  );

  router.get('/', authenticateRole, asyncHandler(clinicianController.getAllClinicians));

  router.get(
    '/:id/appointments',
    authenticateRole,
    requireRole(UserRole.CLINICIAN, UserRole.ADMIN),
    validateQuery(appointmentQuerySchema),
    asyncHandler(appointmentController.getClinicianAppointments)
  );

  return router;
};
