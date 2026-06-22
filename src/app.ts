import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { prisma } from './lib/prisma.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/error.middleware.js';

// Repositories
import { ClinicianRepository } from './repositories/clinician.repository.js';
import { PatientRepository } from './repositories/patient.repository.js';
import { AppointmentRepository } from './repositories/appointment.repository.js';

// Services
import { ClinicianService } from './services/clinician.service.js';
import { PatientService } from './services/patient.service.js';
import { AppointmentService } from './services/appointment.service.js';

// Controllers
import { ClinicianController } from './controllers/clinician.controller.js';
import { PatientController } from './controllers/patient.controller.js';
import { AppointmentController } from './controllers/appointment.controller.js';

// Routes
import { createClinicianRoutes } from './routes/clinician.routes.js';
import { createPatientRoutes } from './routes/patient.routes.js';
import { createAppointmentRoutes } from './routes/appointment.routes.js';

export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Dependency injection - Wire up all layers
  const clinicianRepo = new ClinicianRepository(prisma);
  const patientRepo = new PatientRepository(prisma);
  const appointmentRepo = new AppointmentRepository(prisma);

  const clinicianService = new ClinicianService(clinicianRepo);
  const patientService = new PatientService(patientRepo);
  const appointmentService = new AppointmentService(
    appointmentRepo,
    clinicianRepo,
    patientRepo
  );

  const clinicianController = new ClinicianController(clinicianService);
  const patientController = new PatientController(patientService);
  const appointmentController = new AppointmentController(appointmentService);

  // API routes
  app.use('/api/clinicians', createClinicianRoutes(clinicianController, appointmentController));
  app.use('/api/patients', createPatientRoutes(patientController));
  app.use('/api/appointments', createAppointmentRoutes(appointmentController));

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
};
