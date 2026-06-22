import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { asyncHandler } from '../middleware/async.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { authenticateRole, requireRole } from '../middleware/auth.middleware.js';
import { createPatientSchema } from '../schemas/patient.schema.js';
import { UserRole } from '../types/domain.js';

export const createPatientRoutes = (controller: PatientController) => {
  const router = Router();

  router.post(
    '/',
    authenticateRole,
    requireRole(UserRole.ADMIN),
    validateBody(createPatientSchema),
    asyncHandler(controller.createPatient)
  );

  router.get('/', authenticateRole, asyncHandler(controller.getAllPatients));

  return router;
};
