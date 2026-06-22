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

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Dr. Smith",
  "createdAt": "2024-12-20T10:00:00.000Z",
  "updatedAt": "2024-12-20T10:00:00.000Z"
}
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

**Success Response (201):**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "clinicianId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "660e8400-e29b-41d4-a716-446655440000",
  "startTime": "2024-12-25T10:00:00.000Z",
  "endTime": "2024-12-25T11:00:00.000Z",
  "createdAt": "2024-12-20T10:00:00.000Z",
  "updatedAt": "2024-12-20T10:00:00.000Z",
  "clinician": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. Smith"
  },
  "patient": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input (bad dates, start >= end)
- `404 Not Found` - Clinician or patient doesn't exist
- `409 Conflict` - Appointment overlaps with existing appointment
- `403 Forbidden` - Missing or invalid X-Role header

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

---

## Design Decisions & Trade-offs

### 1. SERIALIZABLE Transaction Isolation

**Decision**: Use SQLite's SERIALIZABLE isolation level for appointment creation.

**Why**: Prevents race conditions where two concurrent requests could both see no overlap and create conflicting appointments.

**How it works**:
```typescript
await prisma.$transaction(
  async (tx) => {
    // 1. Check for overlaps
    const overlapping = await tx.appointment.findFirst({ ... });
    if (overlapping) throw new Error('OVERLAP_DETECTED');
    
    // 2. Create appointment
    return await tx.appointment.create({ ... });
  },
  { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
);
```

**Trade-offs**:
- ✅ **Pro**: Simple, correct, database handles concurrency
- ✅ **Pro**: Impossible to double-book
- ❌ **Con**: SQLite has global write lock (one write at a time)
- ❌ **Con**: Doesn't scale horizontally

**Production solution**: Migrate to PostgreSQL with row-level locks.

---

### 2. Overlap Detection Algorithm

**Implementation**:
```typescript
// Two appointments overlap if:
start < other.end && end > other.start

// Touching endpoints are ALLOWED:
end === other.start  // OK
start === other.end  // OK
```

**Tested edge cases** (7 scenarios):
1. ✅ Non-overlapping (separate times)
2. ✅ Touching endpoints (end === other.start)
3. ❌ Partial overlap (start time)
4. ❌ Partial overlap (end time)
5. ❌ Fully contained
6. ❌ Fully containing
7. ✅ Same time, different clinicians

**Why this formula works**: It catches all overlap cases while explicitly allowing touching appointments per requirements.

---

### 3. Layered Architecture

**Decision**: Strict separation of Controllers → Services → Repositories.

**Why**:
- **Testability**: Can test business logic without HTTP
- **Maintainability**: Changes to one layer don't affect others
- **Clarity**: Each layer has a single responsibility

**Example flow**:
```
HTTP Request
  → Controller (validates, formats)
  → Service (business logic, validation)
  → Repository (database operations)
  → Prisma (SQL)
```

---

### 4. Explicit Entity Creation

**Decision**: Require explicit POST endpoints for clinicians/patients (not auto-create).

**Why**:
- More realistic API design
- Better validation
- Clear entity lifecycle
- Prevents accidental typos creating ghost records

**Alternative**: Could auto-create on first reference, but less explicit.

---

### 5. Role-Based Access via Header

**Decision**: Use `X-Role` header instead of JWT.

**Why**:
- Meets bonus requirement
- Simple for demo/testing
- Easy to extend to JWT later

**Access matrix**:
| Endpoint | patient | clinician | admin |
|----------|---------|-----------|-------|
| POST /appointments | ✅ | ❌ | ✅ |
| GET /appointments | ❌ | ❌ | ✅ |
| GET /clinicians/:id/appointments | ❌ | ✅ | ✅ |
| POST /clinicians | ❌ | ❌ | ✅ |
| POST /patients | ❌ | ❌ | ✅ |

**Production**: Replace with JWT authentication.

---

### 6. Composite Database Index

**Decision**: Index on `(clinicianId, startTime, endTime)`.

**Why**:
- Optimizes overlap queries (O(log n) instead of O(n))
- Improves clinician appointment lists
- Small storage overhead

**Query pattern**:
```sql
SELECT * FROM appointments
WHERE clinician_id = ? 
  AND start_time < ? 
  AND end_time > ?;
-- This becomes an index-only scan
```

---

## Production Considerations

### Scalability Limitations & Solutions

**Current limitations**:
1. **SQLite**: Single-file database, no horizontal scaling
   - **Solution**: Migrate to PostgreSQL with connection pooling

2. **SERIALIZABLE isolation**: Global write lock under load
   - **Solution**: PostgreSQL row-level locks (`SELECT ... FOR UPDATE`)
   - **Alternative**: Optimistic locking with version numbers

3. **No caching**: Every request hits database
   - **Solution**: Redis for frequently-accessed data (clinician schedules)

### Observability (Not Implemented)

For production, add:
- **Logging**: Pino for structured JSON logs with request IDs
- **Metrics**: Prometheus (prom-client) for request rate, latency, error rate
- **Tracing**: OpenTelemetry for distributed tracing
- **Error Tracking**: Sentry for exception capture and alerting
- **Health Checks**: `/health` endpoint with database connectivity check

### Security Enhancements

- Replace `X-Role` header with JWT authentication
- Add rate limiting (express-rate-limit)
- Implement CORS policies
- Add request ID tracking
- Sanitize error messages (no stack traces in production)
- Add HTTPS/TLS termination

### Data Integrity

- Add unique constraint on clinician name (if business requires)
- Consider soft deletes for audit trail
- Add audit timestamps (who created/modified)
- Implement appointment cancellation workflow

---

## Testing Strategy

### Test Coverage

```bash
npm run test:coverage
```

**Coverage target**: 80%+ overall, 100% for critical paths

### Unit Tests

- **Overlap detection logic** (7 scenarios)
- **Service-level validations** (past appointments, entity existence)
- **Date parsing and formatting**

### Integration Tests

- **Full HTTP request/response cycle**
- **End-to-end appointment creation**
- **Role-based access control**
- **Error handling** (400, 403, 404, 409)

### Test Database

- Uses in-memory SQLite (`:memory:`)
- Fast (no disk I/O)
- Isolated (each test starts fresh)
- Identical schema to production

---

## Project Structure

```
clinic-appointment-system/
├── src/
│   ├── types/           # Domain models & error classes
│   ├── schemas/         # Zod validation schemas
│   ├── lib/             # Prisma client singleton
│   ├── repositories/    # Data access layer (CRUD + transactions)
│   ├── services/        # Business logic layer
│   ├── controllers/     # HTTP request handlers
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Express middleware
│   ├── config/          # Swagger configuration
│   ├── app.ts           # Express app setup
│   └── server.ts        # Entry point
├── tests/
│   ├── setup.ts         # Test configuration
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── prisma/
│   └── schema.prisma    # Database schema
├── DESIGN.md            # Comprehensive design document
├── README.md            # This file
└── package.json
```

---

## Key Implementation Details

### Overlap Detection Query

```typescript
// In appointment.repository.ts
const overlapping = await tx.appointment.findFirst({
  where: {
    clinicianId,
    AND: [
      { startTime: { lt: endTime } },    // other.start < our.end
      { endTime: { gt: startTime } },     // other.end > our.start
    ],
  },
});
```

### Date Validation with Zod

```typescript
// In appointment.schema.ts
const isoDateTimeString = z.string().refine(
  (val) => isValid(parseISO(val)),
  { message: 'Invalid ISO 8601 datetime format' }
);

export const createAppointmentSchema = z.object({
  startTime: isoDateTimeString,
  endTime: isoDateTimeString,
  // ...
}).refine(
  (data) => isBefore(parseISO(data.startTime), parseISO(data.endTime)),
  { message: 'startTime must be before endTime' }
);
```

---

## Troubleshooting

### Database Issues

**Problem**: `Error: Can't find Prisma Client`  
**Solution**: Run `npx prisma generate`

**Problem**: `Error: Migration failed`  
**Solution**: Delete `dev.db` and run `npx prisma migrate dev --name init` again

### Test Issues

**Problem**: Tests timing out  
**Solution**: Increase test timeout in `vitest.config.ts`

**Problem**: Tests failing with "database is locked"  
**Solution**: Make sure no other process is using the database

---

## License

MIT

---

## Time Breakdown

**Total development time**: ~3.5 hours

- Phase 0: Infrastructure (30 min)
- Phase 1: Database & Domain Layer (30 min)
- Phase 2: Validation & Business Logic (45 min)
- Phase 3: HTTP Layer (45 min)
- Phase 4: Testing (60 min)
- Documentation (30 min)
