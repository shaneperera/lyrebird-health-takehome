import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clinic Appointment System API',
      version: '1.0.0',
      description: 'RESTful API for managing clinic appointments with overlap detection',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        RoleHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Role',
          description: 'User role: patient, clinician, or admin',
        },
      },
    },
    security: [
      {
        RoleHeader: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
