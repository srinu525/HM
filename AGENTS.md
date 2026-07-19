# HM System — Project Status

## Architecture

```
D:\HM
├── client/          Next.js 16 + Tailwind CSS (Turbopack)
├── server/          Express + Prisma + PostgreSQL (Supabase) + Socket.IO
├── .github/         CI/CD workflows
├── docker-compose.yml  Docker orchestration
├── packages/        Shared types, validation, config (planned)
├── docs/            Architecture docs (planned)
└── AGENTS.md        This file
```

**Database:** Supabase PostgreSQL (`aws-1-ap-south-1.pooler.supabase.com`)
**Default Org:** "Default Hospital" (slug: `default-hospital`)
**Default Credentials:** `admin@hospital.com` / `admin123` / org: `default-hospital`

---

## Role-Based Architecture

### Role Hierarchy & Responsibilities

```
SUPER_ADMIN (Platform)
├── Manages all organizations
├── Platform-wide user management
├── Feature flags, revenue analytics
├── Cannot access org-level operations

ADMIN (Hospital Administrator)
├── User management (create, activate/deactivate staff)
├── Department management
├── Role & permission configuration
├── Staff schedule management
├── Organization settings
├── Reports (read-only oversight)
├── Audit logs
├── Invoices (status updates, delete)
├── Subscription management
├── Does NOT do operational work (no patient registration, no prescriptions, no dispensing)

RECEPTIONIST (Front Desk)
├── Patient registration & management
├── Appointment booking
├── Queue management
├── Invoice creation & payments
├── Reports (appointment history)

DOCTOR (Clinical)
├── Consultations (queue, diagnosis, prescriptions)
├── Patient records (read)
├── Lab tests & results
├── Schedule viewing
├── Leave requests

PHARMACIST (Pharmacy)
├── Medicine management (CRUD)
├── Inventory alerts (low stock, expiry)
├── Sales processing
├── Prescription viewing
├── Lab results viewing

PATIENT (Patient Portal)
├── Self-service: appointments, prescriptions, lab results, invoices
├── Profile management
```

### What ADMIN Can vs Cannot Do

| Domain | Access Level | Notes |
|--------|-------------|-------|
| Users | Full CRUD | Create, activate/deactivate staff |
| Departments | Full CRUD | Create, edit, toggle active |
| Roles & Permissions | Full CRUD | Configure permissions per role |
| Schedules | Full CRUD | Doctor schedules, leave approval |
| Settings | Full CRUD | Org config (timezone, currency, etc.) |
| Reports | Read-only | Appointment + invoice reports |
| Audit Logs | Read-only | Monitor all changes |
| Invoices | Read + status/delete | Financial oversight |
| **Reception** | **NO ACCESS** | RECEPTIONIST only |
| **Doctor Consultations** | **NO ACCESS** | DOCTOR only |
| **Pharmacy** | **NO ACCESS** | PHARMACIST only |
| **Lab** | **NO ACCESS** | DOCTOR/PHARMACIST only |

---

## Completed Phases

### Phase 1 — Foundation ✅

1. Organization Model & Multi-Tenancy
2. Authentication (orgSlug login, JWT with organizationId)
3. Tenant Middleware (organizationId scoping)
4. API Versioning (`/api/v1/`)
5. Standardized API Responses (`sendSuccess`, `sendError`, `sendPaginated`)
6. Error Handling (AppError, global errorHandler)
7. Logging (Pino)
8. Environment Config
9. Client Auth Flow (auto-redirect on 401/403)
10. Age/DOB Auto-Calculation

### Phase 2 — Complete Core ✅

1. TypeScript Errors — Fixed
2. Role-Based Route Guards — Complete
3. Organization Management UI — Complete
4. Dashboard Widgets (role-specific) — Complete
5. Notifications (Socket.IO real-time) — Complete
6. Patient Search (debounce, pagination) — Complete
7. Prescription PDF Generation — Complete

### Phase 3 — Business Features ✅

1. Subscription Plans (Free / Starter / Professional / Enterprise)
2. Audit Logs (automatic middleware, CRUD, filters)
3. File Uploads (multer disk storage)
4. Reports & Analytics (date/doctor filters, CSV export)
5. Lab Module (test management, results recording)
6. Advanced Inventory (expiry tracking, reorder alerts, batch numbers)
7. Payments & Invoicing (invoice CRUD, PDF, payment recording, stats)

### Phase 4 — Enterprise ✅

1. Cron Jobs (backup, appointment reminders, medicine expiry, subscription renewal)
2. Event Bus (EventEmitter-based decoupled architecture)
3. Email Notifications (nodemailer with HTML templates)
4. Backup & Restore (pg_dump with rotation)
5. OpenAPI/Swagger Documentation
6. Monitoring & Observability (health checks, metrics, memory tracking)
7. Docker Configuration (Dockerfile + docker-compose.yml)
8. CI/CD Pipeline (GitHub Actions)

### Phase 5 — Admin Role Restructure ✅

1. **Stripped Admin of operational access** — removed from reception, doctor, pharmacy, lab routes
2. **Admin sidebar redesigned** — now shows: Users, Departments, Roles & Permissions, Schedules, Settings, Organizations, Billing, Audit Logs, Reports, Invoices, Notifications
3. **Department Management** — CRUD with consultation fees, working hours, user counts
4. **Organization Settings** — 4-tab settings (General, Appointment, Pharmacy, Billing)
5. **Role & Permission System** — 37 default permissions across 13 modules, checkbox-based role editor
6. **Staff Scheduling** — Weekly schedule editor per doctor, leave request management with approve/reject
7. **PWA Support** — manifest.json, service worker, icons, offline caching

---

## Schema (Prisma)

### Core Models
```
Organization    id, name, slug, email, phone, address, logo, timezone, currency,
                gstVat, hospitalLicense, isActive
User            id, name, email, password, role, phone, isActive, organizationId, departmentId
Patient         id, patientId, name, phone, email, password, gender, age, dob, address, organizationId
Appointment     id, token, status, date, validUntil, notes, consultationFee, patientId, doctorId
Consultation    id, diagnosis, notes, appointmentId, doctorId
Prescription    id, notes, consultationId, patientId
PrescriptionItem id, dosage, duration, instructions, quantity, prescriptionId, medicineId
```

### Pharmacy Models
```
Medicine        id, name, description, price, stock, expiryDate, batchNumber, reorderLevel, isActive, organizationId
Sale            id, total, patientId
SaleItem        id, quantity, unitPrice, total, saleId, medicineId
```

### Lab Models
```
LabTest         id, name, description, price, isActive, organizationId
LabResult       id, result (JSON), notes, status, labTestId, patientId, doctorId, organizationId
```

### Finance Models
```
Invoice         id, invoiceNumber, amount, tax, total, description, status, dueDate, paidAt, organizationId, subscriptionId?, patientId?
InvoiceItem     id, description, quantity, unitPrice, total, invoiceId
Payment         id, amount, method, reference, notes, status, organizationId, invoiceId?, patientId?
```

### Subscription Models
```
Plan            id, name, description, price, maxUsers, maxPatients, features[], isActive
Subscription    id, startDate, endDate, status, organizationId, planId
```

### Admin & System Models
```
AuditLog        id, action, entity, entityId, oldValue (JSON), newValue (JSON), ipAddress, userAgent, organizationId, userId?
Notification    id, message, type, isRead, userId, organizationId
FileAttachment  id, filename, originalName, mimeType, size, path, entity, entityId, organizationId, uploadedById?
FeatureFlag     id, key, name, description, isEnabled, organizationId
PlatformSetting id, key (unique), value, category
```

### Department & Settings (Phase 5)
```
Department      id, name, description, consultationFee, workingHours, isActive, organizationId
OrgSetting      id, key, value, category, organizationId
```

### Permission System (Phase 5)
```
Permission      id, name (unique), description, module, action
RolePermission  id, role, permissionId
UserPermission  id, userId, permissionId, granted
```

### Scheduling (Phase 5)
```
StaffSchedule   id, dayOfWeek (0-6), startTime, endTime, isAvailable, userId
LeaveRequest    id, userId, startDate, endDate, reason, status, approvedBy, organizationId
```

### Enums
```
Role            SUPER_ADMIN, ADMIN, RECEPTIONIST, DOCTOR, PHARMACIST, PATIENT
AppointmentStatus SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
Gender          MALE, FEMALE, OTHER
```

---

## Default Permissions (Phase 5)

Seeded via `POST /api/v1/permissions/seed`:

| Module | Permissions |
|--------|-------------|
| patients | read, create, update, delete |
| appointments | read, create, update, delete |
| consultations | read, create, update |
| prescriptions | read, create |
| pharmacy | read, create, update, delete |
| lab | read, create, update |
| invoices | read, create, update, delete |
| users | read, create, update, delete |
| departments | read, create, update, delete |
| settings | read, update |
| audit-logs | read |
| reports | read |
| notifications | read, create |

---

## API Reference

### Auth
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/v1/auth/login` | Public | Login with email/password/orgSlug |
| POST | `/api/v1/auth/register` | ADMIN | Register new user |

### Users
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/users` | ADMIN | List all users |
| GET | `/api/v1/users/doctors` | Any auth | List active doctors |
| GET | `/api/v1/users/:id` | ADMIN | Get user by ID |
| PUT | `/api/v1/users/:id` | ADMIN | Update user (activate/deactivate) |

### Patients
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/patients` | RECEPTIONIST, DOCTOR | List/search patients |
| GET | `/api/v1/patients/:id` | RECEPTIONIST, DOCTOR | Get patient |
| POST | `/api/v1/patients` | RECEPTIONIST | Register patient |
| PUT | `/api/v1/patients/:id` | RECEPTIONIST | Update patient |

### Appointments
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/v1/appointments` | RECEPTIONIST | Book appointment |
| GET | `/api/v1/appointments` | RECEPTIONIST, DOCTOR | Today's appointments |
| GET | `/api/v1/appointments/doctor/:doctorId` | RECEPTIONIST, DOCTOR | Doctor's appointments |
| GET | `/api/v1/appointments/queue/:doctorId` | RECEPTIONIST, DOCTOR | Doctor's queue |
| PUT | `/api/v1/appointments/:id/status` | RECEPTIONIST, DOCTOR | Update status |

### Consultations
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/v1/consultations` | DOCTOR | Create consultation |
| GET | `/api/v1/consultations` | DOCTOR | Get by doctor |
| GET | `/api/v1/consultations/completed-today` | DOCTOR | Today's completed |
| GET | `/api/v1/consultations/patient/:patientId` | DOCTOR | Patient history |

### Pharmacy
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/pharmacy/medicines` | PHARMACIST, DOCTOR | List medicines |
| POST | `/api/v1/pharmacy/medicines` | PHARMACIST | Add medicine |
| PUT | `/api/v1/pharmacy/medicines/:id` | PHARMACIST | Update medicine |
| PUT | `/api/v1/pharmacy/medicines/:id/stock` | PHARMACIST | Update stock |
| GET | `/api/v1/pharmacy/inventory/alerts` | PHARMACIST | Inventory alerts |
| GET | `/api/v1/pharmacy/sales` | PHARMACIST | Sales history |
| POST | `/api/v1/pharmacy/sales` | PHARMACIST | Create sale |
| GET | `/api/v1/pharmacy/prescriptions` | PHARMACIST, DOCTOR | List prescriptions |
| GET | `/api/v1/pharmacy/prescriptions/:id/pdf` | PHARMACIST, DOCTOR | Download PDF |
| POST | `/api/v1/pharmacy/prescriptions` | DOCTOR | Create prescription |

### Lab
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/lab/tests` | DOCTOR, PHARMACIST | List tests |
| POST | `/api/v1/lab/tests` | DOCTOR | Create test |
| PUT | `/api/v1/lab/tests/:id` | DOCTOR | Update test |
| GET | `/api/v1/lab/results` | DOCTOR, PHARMACIST | List results |
| POST | `/api/v1/lab/results` | DOCTOR | Create result |
| PUT | `/api/v1/lab/results/:id` | DOCTOR | Update result |

### Invoices
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/invoices` | RECEPTIONIST, ADMIN | List invoices |
| GET | `/api/v1/invoices/stats` | RECEPTIONIST, ADMIN | Invoice stats |
| GET | `/api/v1/invoices/:id` | RECEPTIONIST, ADMIN | Get invoice |
| POST | `/api/v1/invoices` | RECEPTIONIST, ADMIN | Create invoice |
| PUT | `/api/v1/invoices/:id/status` | ADMIN | Update status |
| DELETE | `/api/v1/invoices/:id` | ADMIN | Delete invoice |
| GET | `/api/v1/invoices/:id/pdf` | RECEPTIONIST, ADMIN | Download PDF |
| POST | `/api/v1/invoices/payments` | RECEPTIONIST, ADMIN | Record payment |
| GET | `/api/v1/invoices/payments/list` | RECEPTIONIST, ADMIN | List payments |

### Departments (Phase 5)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/departments` | ADMIN | List departments |
| GET | `/api/v1/departments/:id` | ADMIN | Get department |
| POST | `/api/v1/departments` | ADMIN | Create department |
| PUT | `/api/v1/departments/:id` | ADMIN | Update department |
| PUT | `/api/v1/departments/:id/toggle-active` | ADMIN | Toggle active |

### Settings (Phase 5)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/settings` | ADMIN | List settings (filter by category) |
| GET | `/api/v1/settings/:key` | ADMIN | Get setting by key |
| PUT | `/api/v1/settings` | ADMIN | Upsert single setting |
| PUT | `/api/v1/settings/bulk` | ADMIN | Bulk upsert settings |

### Permissions (Phase 5)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/permissions` | ADMIN | List all permissions |
| GET | `/api/v1/permissions/roles/:role` | ADMIN | Get role permissions |
| PUT | `/api/v1/permissions/roles/:role` | ADMIN | Set role permissions |
| GET | `/api/v1/permissions/users/:userId` | ADMIN | Get user permissions |
| PUT | `/api/v1/permissions/users/:userId` | ADMIN | Set user permissions |
| POST | `/api/v1/permissions/seed` | ADMIN | Seed default permissions |

### Scheduling (Phase 5)
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/scheduling/schedule/:userId` | ADMIN, DOCTOR | Get user schedule |
| PUT | `/api/v1/scheduling/schedule/:userId` | ADMIN | Upsert schedule |
| GET | `/api/v1/scheduling/doctors` | ADMIN | All doctor schedules |
| GET | `/api/v1/scheduling/leaves` | ADMIN | Leave requests |
| POST | `/api/v1/scheduling/leaves` | ADMIN, DOCTOR, RECEPTIONIST | Request leave |
| PUT | `/api/v1/scheduling/leaves/:id` | ADMIN | Approve/reject leave |

### Notifications
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/notifications` | All | List notifications |
| GET | `/api/v1/notifications/unread-count` | All | Unread count |
| PUT | `/api/v1/notifications/:id/read` | All | Mark read |
| PUT | `/api/v1/notifications/read-all` | All | Mark all read |

### Stats
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/stats` | RECEPTIONIST | Dashboard stats |
| GET | `/api/v1/stats/analytics` | RECEPTIONIST | Analytics data |
| GET | `/api/v1/stats/appointments/history` | RECEPTIONIST | Appointment history |
| GET | `/api/v1/stats/sales/history` | PHARMACIST | Sales history |

### Billing
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/billing/plans` | All | List plans |
| GET | `/api/v1/billing/subscription` | All | Current subscription |
| POST | `/api/v1/billing/subscription` | ADMIN | Subscribe |
| PUT | `/api/v1/billing/subscription/:id/cancel` | ADMIN | Cancel subscription |

### Other
| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/audit-logs` | SUPER_ADMIN, ADMIN | Audit log entries |
| POST | `/api/v1/files/upload` | All | Upload file |
| GET | `/api/v1/files` | All | List files |
| GET | `/api/v1/files/:id/download` | All | Download file |
| DELETE | `/api/v1/files/:id` | All | Delete file |

---

## Client Pages

### Sidebar Navigation by Role

**ADMIN:**
```
Main → Dashboard
Administration → Users, Departments, Roles & Permissions, Schedules, Settings, Organizations, Subscription, Audit Logs
Reports → Appointments, Invoices
System → Notifications
```

**RECEPTIONIST:**
```
Main → Dashboard
Patient Care → Reception, Patients, New Appointment, Queue View, Appointments List
Finance → Invoices
System → Notifications
```

**DOCTOR:**
```
Main → Dashboard
Patient Care → Patients, Consultations, Queue
Pharmacy → Prescriptions
Clinical → Lab
System → Notifications
```

**PHARMACIST:**
```
Main → Dashboard
Pharmacy → Overview, Inventory, Sales, Prescriptions
Clinical → Lab
System → Notifications
```

### Key Client Files

| File | Purpose |
|------|---------|
| `lib/api.ts` | Axios client + all API functions (userApi, patientApi, appointmentApi, consultationApi, pharmacyApi, labApi, invoiceApi, billingApi, auditLogApi, fileApi, departmentApi, settingsApi, permissionApi, schedulingApi, adminApi, patientPortalApi) |
| `contexts/auth-context.tsx` | Auth state management |
| `components/route-guard.tsx` | Role-based route protection |
| `components/role-dashboards.tsx` | Role-specific dashboard widgets |
| `components/notification-bell.tsx` | Real-time notification bell |
| `components/pwa-registration.tsx` | PWA service worker registration |
| `components/file-upload.tsx` | Reusable file upload component |
| `hooks/use-socket.ts` | Socket.IO real-time hook |
| `hooks/use-debounce.ts` | Search debounce hook |
| `app/dashboard/layout.tsx` | Sidebar navigation per role |
| `app/dashboard/page.tsx` | Role-based dashboard rendering |
| `app/dashboard/users/page.tsx` | User management (ADMIN) |
| `app/dashboard/departments/page.tsx` | Department management (ADMIN) |
| `app/dashboard/roles/page.tsx` | Role & permission editor (ADMIN) |
| `app/dashboard/schedules/page.tsx` | Doctor schedules & leave requests (ADMIN) |
| `app/dashboard/settings/page.tsx` | Org settings 4-tab page (ADMIN) |
| `app/dashboard/organizations/page.tsx` | Org management (SUPER_ADMIN) |
| `app/dashboard/billing/page.tsx` | Subscription plans (ADMIN) |
| `app/dashboard/audit-logs/page.tsx` | Audit log viewer (ADMIN) |
| `app/dashboard/reception/` | Reception pages (RECEPTIONIST) |
| `app/dashboard/doctor/page.tsx` | Doctor consultation page (DOCTOR) |
| `app/dashboard/pharmacy/` | Pharmacy pages (PHARMACIST) |
| `app/dashboard/lab/page.tsx` | Lab tests & results (DOCTOR/PHARMACIST) |
| `app/dashboard/reports/page.tsx` | Appointment reports (ADMIN, RECEPTIONIST) |
| `app/dashboard/sales/page.tsx` | Sales history (PHARMACIST) |
| `app/dashboard/invoices/page.tsx` | Invoice management (RECEPTIONIST, ADMIN) |

### Key Server Files

| File | Purpose |
|------|---------|
| `src/app.ts` | Express entry, route mounting, Swagger, metrics |
| `src/config/env.ts` | Environment config |
| `src/common/logger.ts` | Pino logger |
| `src/common/response.ts` | Standard API responses |
| `src/common/errors/AppError.ts` | Typed error class |
| `src/common/event-bus.ts` | Event bus for decoupled architecture |
| `src/middleware/auth.ts` | JWT authentication + `authorize()` |
| `src/middleware/tenant.ts` | Tenant scope middleware |
| `src/middleware/audit.ts` | Automatic audit logging |
| `src/middleware/errorHandler.ts` | Global error handler |
| `src/middleware/request-id.ts` | Request ID tracking |
| `src/middleware/metrics.ts` | Request metrics |
| `src/services/metrics.ts` | Health checks |
| `src/services/email.ts` | Nodemailer with HTML templates |
| `src/cron/index.ts` | Cron job scheduler |
| `src/modules/auth/` | Auth with orgSlug login |
| `src/modules/users/` | User CRUD (ADMIN) |
| `src/modules/patients/` | Patient management (RECEPTIONIST) |
| `src/modules/appointments/` | Appointment booking (RECEPTIONIST, DOCTOR) |
| `src/modules/consultations/` | Consultation management (DOCTOR) |
| `src/modules/pharmacy/` | Medicine CRUD, sales, prescriptions (PHARMACIST, DOCTOR) |
| `src/modules/pharmacy/pdf.ts` | PDF prescription generation |
| `src/modules/lab/` | Lab tests & results (DOCTOR, PHARMACIST) |
| `src/modules/invoices/` | Invoice CRUD, payments, PDF |
| `src/modules/notifications/` | Notification service + Socket.IO events |
| `src/modules/organizations/` | Org CRUD (SUPER_ADMIN) |
| `src/modules/plans/` | Subscription plans (SUPER_ADMIN) |
| `src/modules/audit-logs/` | Audit log queries |
| `src/modules/files/` | File upload/download |
| `src/modules/admin/` | Platform admin (SUPER_ADMIN) |
| `src/modules/stats/` | Dashboard statistics |
| `src/modules/departments/` | Department management (ADMIN) — **Phase 5** |
| `src/modules/settings/` | Org settings CRUD (ADMIN) — **Phase 5** |
| `src/modules/permissions/` | Permission system (ADMIN) — **Phase 5** |
| `src/modules/permissions/middleware.ts` | `authorizePermission()` middleware — **Phase 5** |
| `src/modules/scheduling/` | Doctor schedules & leave requests (ADMIN) — **Phase 5** |

---

## PWA Support (Phase 5)

- `public/manifest.json` — PWA manifest (standalone, sky-blue theme)
- `public/sw.js` — Service worker with stale-while-revalidate caching
- `public/icons/` — 8 SVG icons (72-512px + maskable)
- `components/pwa-registration.tsx` — Client-side SW registration
- `next.config.ts` — Headers for sw.js and manifest.json

---

## Event Architecture

```
Action (e.g. Patient Created)
  ↓
Event Bus (server/src/common/event-bus.ts)
  ├── → Notification Service → Database → UI
  ├── → Audit Log Service → Database
  ├── → Socket.IO → Real-time push
  └── → Email Service → External (nodemailer)
```

Events: `patient.created`, `appointment.created`, `prescription.created`, `low-stock-alert`, `medicine.expiring`, `medicine.expired`, `subscription.expiring`, `subscription.expired`, `appointment.reminder`

---

## Scheduler (Cron Jobs)

| Job | Schedule | Description |
|-----|----------|-------------|
| Night Backup | Daily 2 AM | Database backup with 7-day rotation |
| Appointment Reminder | Daily 8 AM | Notify patients of tomorrow's appointments |
| Medicine Expiry | Weekly (Mon 9 AM) | Alert for expiring medicines |
| Subscription Renewal | Daily 7 AM | Check & notify upcoming renewals |

---

## API Documentation

Swagger/OpenAPI docs at `http://localhost:5000/api/docs`
JSON spec at `http://localhost:5000/api/docs.json`

---

## Server Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with tsx watch |
| `npm run build` | Build TypeScript to dist/ |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run Prisma migration |
| `npm run db:seed` | Seed database |
| `npm run db:migrate-org` | Run organization migration |
