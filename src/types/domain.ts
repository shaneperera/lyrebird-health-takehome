// Domain models - pure business objects representing core entities

export interface Clinician {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  clinicianId: string;
  patientId: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentWithRelations extends Appointment {
  clinician: Clinician;
  patient: Patient;
}

// Query filters for appointments
export interface AppointmentFilters {
  from?: Date;
  to?: Date;
}

// Role-based access control
export enum UserRole {
  PATIENT = 'patient',
  CLINICIAN = 'clinician',
  ADMIN = 'admin',
}
