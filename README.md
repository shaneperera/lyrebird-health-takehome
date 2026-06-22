# Clinic Appointment System

A RESTful API for managing clinic appointments with overlap detection and concurrency control.

## Features

- ✅ Create and manage clinicians, patients, and appointments
- ✅ Automatic overlap detection for appointments (touching endpoints allowed)
- ✅ SERIALIZABLE transaction isolation to prevent race conditions
- ✅ Role-based access control (patient, clinician, admin)
- ✅ Comprehensive validation with Zod
- ✅ OpenAPI/Swagger documentation
- ✅ Full test coverage (unit + integration tests)

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Validation**: Zod (TypeScript-first schema validation)
- **Testing**: Vitest + Supertest
- **Date handling**: date-fns
- **Documentation**: Swagger/OpenAPI

## Architecture

**Layered architecture** with clear separation of concerns:

```
Controllers (HTTP layer)
    ↓
Services (Business logic)
    ↓
Repositories (Data access)
    ↓
Database (SQLite + Prisma)
```

**Key design principles:**
- DTOs for request/response validation
- Domain models for internal representation
- Dependency injection for testability
- Single responsibility per layer

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

The default `.env` should work for local development:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
```

3. **Initialize the database:**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Start the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`  
Swagger documentation: `http://localhost:3000/api-docs`

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Authentication

All endpoints require an `X-Role` header with one of: `patient`, `clinician`, or `admin`.

### Clinicians

#### Create Clinician (Admin only)
```bash
curl -X POST http://localhost:3000/api/clinicians \
  -H "Content-Type: application/json" \
  -H "X-Role: admin" \
  -d '{"name": "Dr. Smith"}'
```

#### List All Clinicians
```bash
curl http://localhost:3000/api/clinicians \
  -H "X-Role: patient"
```

#### Get Clinician's Appointments (Clinician/Admin only)
```bash
curl http://localhost:3000/api/clinicians/{clinician-id}/appointments \
  -H "X-Role: clinician"

# With date filters
curl "http://localhost:3000/api/clinicians/{clinician-id}/appointments?from=2024-12-01T00:00:00Z&to=2024-12-31T23:59:59Z" \
  -H "X-Role: clinician"
```

---

### Patients

#### Create Patient (Admin only)
```bash
curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "X-Role: admin" \
  -d '{"name": "John Doe"}'
```

#### List All Patients
```bash
curl http://localhost:3000/api/patients \
  -H "X-Role: patient"
```

---

### Appointments

#### Create Appointment (Patient/Admin)
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d '{
    "clinicianId": "550e8400-e29b-41d4-a716-446655440000",
    "patientId": "660e8400-e29b-41d4-a716-446655440000",
    "startTime": "2024-12-25T10:00:00Z",
    "endTime": "2024-12-25T11:00:00Z"
  }'
```

#### List All Appointments (Admin only)
```bash
curl http://localhost:3000/api/appointments \
  -H "X-Role: admin"

# With date filters
curl "http://localhost:3000/api/appointments?from=2024-12-01T00:00:00Z&to=2024-12-31T23:59:59Z" \
  -H "X-Role: admin"
```

---

## Complete Example Workflow

```bash
# 1. Create a clinician (admin)
CLINICIAN_RESPONSE=$(curl -X POST http://localhost:3000/api/clinicians \
  -H "Content-Type: application/json" \
  -H "X-Role: admin" \
  -d '{"name": "Dr. Smith"}')

CLINICIAN_ID=$(echo $CLINICIAN_RESPONSE | jq -r '.id')

# 2. Create a patient (admin)
PATIENT_RESPONSE=$(curl -X POST http://localhost:3000/api/patients \
  -H "Content-Type: application/json" \
  -H "X-Role: admin" \
  -d '{"name": "John Doe"}')

PATIENT_ID=$(echo $PATIENT_RESPONSE | jq -r '.id')

# 3. Create an appointment (patient)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d "{
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"startTime\": \"2024-12-25T10:00:00Z\",
    \"endTime\": \"2024-12-25T11:00:00Z\"
  }"

# 4. Try to create overlapping appointment (should fail with 409)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d "{
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"startTime\": \"2024-12-25T10:30:00Z\",
    \"endTime\": \"2024-12-25T11:30:00Z\"
  }"

# 5. Create touching appointment (should succeed)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "X-Role: patient" \
  -d "{
    \"clinicianId\": \"$CLINICIAN_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"startTime\": \"2024-12-25T11:00:00Z\",
    \"endTime\": \"2024-12-25T12:00:00Z\"
  }"

# 6. List clinician's appointments
curl http://localhost:3000/api/clinicians/$CLINICIAN_ID/appointments \
  -H "X-Role: clinician"
```