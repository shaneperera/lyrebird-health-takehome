import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointment.service.js';
import { formatISO } from 'date-fns';

export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  createAppointment = async (req: Request, res: Response) => {
    const appointment = await this.appointmentService.createAppointment(req.body);

    res.status(201).json({
      id: appointment.id,
      clinicianId: appointment.clinicianId,
      patientId: appointment.patientId,
      startTime: formatISO(appointment.startTime),
      endTime: formatISO(appointment.endTime),
      createdAt: formatISO(appointment.createdAt),
      updatedAt: formatISO(appointment.updatedAt),
      clinician: {
        id: appointment.clinician.id,
        name: appointment.clinician.name,
      },
      patient: {
        id: appointment.patient.id,
        name: appointment.patient.name,
      },
    });
  };

  getClinicianAppointments = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { from, to } = req.query as { from?: string; to?: string };

    const appointments = await this.appointmentService.getClinicianAppointments(id, {
      from,
      to,
    });

    res.json(
      appointments.map((apt) => ({
        id: apt.id,
        clinicianId: apt.clinicianId,
        patientId: apt.patientId,
        startTime: formatISO(apt.startTime),
        endTime: formatISO(apt.endTime),
        createdAt: formatISO(apt.createdAt),
        updatedAt: formatISO(apt.updatedAt),
        clinician: {
          id: apt.clinician.id,
          name: apt.clinician.name,
        },
        patient: {
          id: apt.patient.id,
          name: apt.patient.name,
        },
      }))
    );
  };

  getAllAppointments = async (req: Request, res: Response) => {
    const { from, to } = req.query as { from?: string; to?: string };

    const appointments = await this.appointmentService.getAllUpcomingAppointments({
      from,
      to,
    });

    res.json(
      appointments.map((apt) => ({
        id: apt.id,
        clinicianId: apt.clinicianId,
        patientId: apt.patientId,
        startTime: formatISO(apt.startTime),
        endTime: formatISO(apt.endTime),
        createdAt: formatISO(apt.createdAt),
        updatedAt: formatISO(apt.updatedAt),
        clinician: {
          id: apt.clinician.id,
          name: apt.clinician.name,
        },
        patient: {
          id: apt.patient.id,
          name: apt.patient.name,
        },
      }))
    );
  };
}
