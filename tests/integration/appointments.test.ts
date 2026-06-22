import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import type { Express } from 'express';

describe('POST /api/appointments', () => {
  let app: Express;
  let clinicianId: string;
  let patientId: string;

  beforeAll(async () => {
    app = createApp();

    // Create test data
    const clinicianRes = await request(app)
      .post('/api/clinicians')
      .set('X-Role', 'admin')
      .send({ name: 'Dr. Smith' });
    clinicianId = clinicianRes.body.id;

    const patientRes = await request(app)
      .post('/api/patients')
      .set('X-Role', 'admin')
      .send({ name: 'John Doe' });
    patientId = patientRes.body.id;
  });

  it('should create appointment successfully', async () => {
    const futureDate = new Date(Date.now() + 86400000);
    const response = await request(app)
      .post('/api/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId,
        patientId,
        startTime: futureDate.toISOString(),
        endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.clinicianId).toBe(clinicianId);
  });

  it('should reject overlapping appointment with 409', async () => {
    const futureDate = new Date(Date.now() + 86400000);

    // Create first appointment
    await request(app)
      .post('/api/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId,
        patientId,
        startTime: futureDate.toISOString(),
        endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
      });

    // Try overlapping
    const response = await request(app)
      .post('/api/appointments')
      .set('X-Role', 'patient')
      .send({
        clinicianId,
        patientId,
        startTime: new Date(futureDate.getTime() + 1800000).toISOString(),
        endTime: new Date(futureDate.getTime() + 5400000).toISOString(),
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('overlap');
  });

  it('should require X-Role header', async () => {
    const futureDate = new Date(Date.now() + 86400000);
    const response = await request(app)
      .post('/api/appointments')
      .send({
        clinicianId,
        patientId,
        startTime: futureDate.toISOString(),
        endTime: new Date(futureDate.getTime() + 3600000).toISOString(),
      });

    expect(response.status).toBe(403);
  });
});
