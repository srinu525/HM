# HM System — Project Status

## Architecture

```
D:\HM
├── client/          Next.js 16 + Tailwind CSS (Turbopack)
├── server/          Express + Prisma + PostgreSQL (Supabase) + Socket.IO
├── packages/        Shared types, validation, config (planned)
├── docs/            Architecture docs (planned)
└── AGENTS.md        This file
```

**Database:** Supabase PostgreSQL (`aws-1-ap-south-1.pooler.supabase.com`)
**Default Org:** "Default Hospital" (slug: `default-hospital`)
**Default Credentials:** `admin@hospital.com` / `admin123` / org: `default-hospital`

---

## What We Did (Phase 1 — Foundation) ✅

### 1. Organization Model & Multi-Tenancy
- Added `Organization` model to Prisma schema (`name`, `slug` unique)
- Added `organizationId` foreign key to `User`, `Patient`, `Medicine`, `Notification`
- Added composite unique constraints (`email_organizationId` on User, etc.)
- Ran migration via `server/src/migrate.ts` (`npm run db:migrate-org`)
- Seeded default organization in `server/src/seed.ts`

### 2. Authentication Improvements
- Login now requires `organizationSlug` (not just email/password)
- JWT token now includes `organizationId` in payload
- Auth service validates org exists before login
- Added `SUPER_ADMIN` role to schema and token
- `auth-context.tsx` passes `organizationSlug` in login request
- Login page has Organization Slug input field

### 3. Tenant Middleware
- `server/src/middleware/tenant.ts` — verifies `organizationId` exists on token
- Applied to all data routes (patients, appointments, pharmacy, etc.)
- All service queries scoped by `organizationId` from JWT

### 4. API Versioning
- All routes mounted at `/api/v1/` in `app.ts`
- Backward-compatible `/api/` routes preserved
- Client `lib/api.ts` base URL: `http://localhost:5000/api/v1`
- `client/.env.local` updated to match

### 5. Standardized API Responses
- `server/src/common/response.ts` — `sendSuccess()`, `sendCreated()`, `sendError()`, `sendPaginated()`
- All controllers return `{ success: boolean, message: string, data: T }` envelope
- Client updated to unwrap `response.data.data` (44 occurrences across 16 files)

### 6. Error Handling
- `server/src/common/errors/AppError.ts` — typed error class with static factories
  - `AppError.unauthorized()`, `AppError.forbidden()`, `AppError.notFound()`, etc.
- `server/src/middleware/errorHandler.ts` — global error handler with Pino logging
- Controllers throw `AppError` instead of raw `Error`

### 7. Logging
- Installed `pino` package
- `server/src/common/logger.ts` — Pino logger with JSON output
- `app.ts` uses Pino-wrapped Morgan for HTTP logging
- `socket.ts` uses Pino logger

### 8. Environment Config
- `server/src/config/env.ts` — centralized env with `required()`/`optional()` helpers
- Replaces scattered `process.env` calls

### 9. Client Auth Flow
- `lib/api.ts` — Axios interceptor auto-redirects on 401/403 (stale token detection)
- `auth-context.tsx` — stores `user` with `organizationId`, `organization`
- `dashboard/layout.tsx` — `SUPER_ADMIN` role has full sidebar access

### 10. Age/DOB Auto-Calculation
- Patient forms auto-calculate `age` from `dob` and vice versa
- `age` field added to Prisma schema, Zod validation, controllers, services

---

## What We're Doing Now (Current Issues)

### Stale Token Fix
- Old tokens (pre-organizationId) cause 403 on `tenantScope` middleware
- Client interceptor auto-clears stale tokens and redirects to login
- **User must log out and log back in** to get a fresh JWT with `organizationId`

---

## Roadmap

### Phase 2 (Complete Core)
1. Fix TypeScript errors (lucide-react icons, tailwind-merge types, nullable props)
2. Role-based route guards (client-side + middleware)
3. Organization management UI (SUPER_ADMIN)
4. Shared `packages/` directory
5. Dashboard widgets (role-specific home pages)
6. Notifications (Socket.IO real-time, preferences)
7. Patient search (debounce, pagination, history timeline)
8. Prescription PDF generation

### Phase 3 (Business Features)
- Subscription plans (Free / Starter / Professional / Enterprise)
- Payments & invoicing
- Audit logs (every action tracked)
- File uploads (patient scans, prescriptions, lab reports via Supabase Storage)
- Reports & analytics
- Lab module
- Advanced inventory management

### Phase 4 (Enterprise)
- Cron jobs (night backup, appointment reminders, medicine expiry, subscription renewal)
- Event bus (Patient Created → Notification → Audit → Socket → Email)
- Email/SMS notifications
- Backup & restore
- OpenAPI/Swagger documentation
- Monitoring & observability
- Docker configuration
- CI/CD pipeline

---

## Schema Additions Needed

### Organization Settings
```
Organization
├── logo
├── timezone
├── currency
├── address
├── phone
├── email
├── gstVat
└── hospitalLicense
```

### Subscription System
```
Plan
├── id, name, price, features[]
└── Free / Starter / Professional / Enterprise

Subscription
├── organizationId, planId, startDate, endDate, status

Payment
├── subscriptionId, amount, method, status, invoiceUrl

Invoice
├── subscriptionId, amount, items[], status
```

### Audit Logs
```
AuditLog
├── id
├── organizationId
├── userId
├── action (CREATE / UPDATE / DELETE)
├── entity (Patient / Appointment / Medicine / etc.)
├── entityId
├── oldValue (JSON)
├── newValue (JSON)
├── ipAddress
├── userAgent
└── createdAt
```

### Permission System (future)
```
Permission
├── id, name (patients.read, appointments.create, etc.)

RolePermission
├── roleId, permissionId

UserPermission
├── userId, permissionId (override)
```

### Soft Delete & Traceability
Add to every business table:
```
createdBy    (userId)
updatedBy    (userId)
deletedAt    (nullable, soft delete)
isActive     (boolean, default true)
```

### Configurable Settings
```
Setting
├── organizationId
├── key (working_hours, token_prefix, prescription_template, currency, language, logo)
└── value
```

---

## File Storage Plan

```
Supabase Storage Buckets:
├── patient-scans/       Patient uploaded documents
├── prescriptions/       Generated PDF prescriptions
├── lab-reports/         Lab report uploads
├── org-logos/           Organization logos
└── invoices/            Generated invoices
```

---

## Event Architecture (future)

```
Action (e.g. Patient Created)
  ↓
Event Bus
  ├── → Notification Service → Database → UI
  ├── → Audit Log Service → Database
  ├── → Socket.IO → Real-time push
  └── → Email/SMS Service → External
```

---

## Scheduler (future cron jobs)

| Job | Schedule | Description |
|-----|----------|-------------|
| Night Backup | Daily 2 AM | Database backup |
| Appointment Reminder | Daily 8 AM | Notify patients of tomorrow's appointments |
| Medicine Expiry | Weekly | Alert for expiring medicines |
| Subscription Renewal | Daily | Check & notify upcoming renewals |
| Daily Reports | Daily 9 PM | Auto-generate daily summary |

---

## Recommended: Repository Layer

```
Controller → Service → Repository → Prisma
```

Makes testing easier. Services become thinner. Prisma calls isolated.

---

## Recommended: API Documentation

Use OpenAPI/Swagger to auto-generate API docs from route definitions.

---

## Server Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with tsx watch |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migration |
| `npm run db:seed` | Seed database |
| `npm run db:migrate-org` | Run organization migration |

## Key Files

### Server
- `server/src/app.ts` — Express entry point, route mounting, API versioning
- `server/src/config/env.ts` — Environment config
- `server/src/common/logger.ts` — Pino logger
- `server/src/common/response.ts` — Standard API responses
- `server/src/common/errors/AppError.ts` — Typed error class
- `server/src/middleware/auth.ts` — JWT authentication + authorization
- `server/src/middleware/tenant.ts` — Tenant scope middleware
- `server/src/middleware/errorHandler.ts` — Global error handler
- `server/src/modules/auth/service.ts` — Auth with orgSlug login
- `server/src/modules/*/service.ts` — All services scoped by organizationId

### Client
- `client/lib/api.ts` — Axios client, types, API functions
- `client/contexts/auth-context.tsx` — Auth state management
- `client/app/login/page.tsx` — Login with org slug
- `client/app/dashboard/layout.tsx` — Sidebar navigation per role
- `client/lib/validations.ts` — Zod schemas with age field
