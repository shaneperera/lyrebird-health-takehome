import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import type { Express } from 'express';

describe('Clinician and Patient Endpoints', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /api/clinicians', () => {
    it('should create clinician with admin role', async () => {
      const response = await request(app)
        .post('/api/clinicians')
        .set('X-Role', 'admin')
        .send({ name: 'Dr. Smith' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Dr. Smith');
    });

    it('should reject without admin role', async () => {
      const response = await request(app)
        .post('/api/clinicians')
        .set('X-Role', 'patient')
        .send({ name: 'Dr. Jones' });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/clinicians', () => {
    it('should list all clinicians', async () => {
      const response = await request(app)
        .get('/api/clinicians')
        .set('X-Role', 'admin');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/patients', () => {
    it('should create patient with admin role', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('X-Role', 'admin')
        .send({ name: 'John Doe' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('John Doe');
    });

    it('should reject without admin role', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('X-Role', 'clinician')
        .send({ name: 'Jane Doe' });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/patients', () => {
    it('should list all patients', async () => {
      const response = await request(app)
        .get('/api/patients')
        .set('X-Role', 'patient');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/clinicians/:id/appointments', () => {
    it('should return 404 for non-existent clinician', async () => {
      const response = await request(app)
        .get('/api/clinicians/00000000-0000-0000-0000-000000000000/appointments')
        .set('X-Role', 'clinician');

      expect(response.status).toBe(404);
    });
  });
});
