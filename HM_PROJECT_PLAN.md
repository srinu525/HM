# HM - Hospital Management System

## Project Overview

HM is a modern Hospital Management System designed for small to medium hospitals and clinics.

- Frontend: Next.js 16 + React 19 + TypeScript
- Backend: Express.js + TypeScript
- Database: PostgreSQL
- ORM: Prisma 7 (with pg driver adapter)
- Realtime: Socket.IO
- UI: Tailwind CSS + shadcn/ui

---

## Development Phases

### Phase 1 - Core Setup ✅ COMPLETED

- [x] Project scaffolding (client + server)
- [x] Prisma schema (10 tables)
- [x] Express server + middleware (CORS, Helmet, Morgan)
- [x] JWT authentication (login, register, profile)
- [x] Role-based access control (ADMIN, RECEPTIONIST, DOCTOR, PHARMACIST)
- [x] All backend API modules (7 modules, 21 endpoints)
  - Auth: register, login, profile
  - Users: CRUD, get doctors
  - Patients: create, search, update, get by ID
  - Appointments: create with auto token, get today's, doctor queue, update status
  - Consultations: create, get by doctor
  - Pharmacy: medicines CRUD, sales with stock deduction, prescriptions
  - Notifications: get, mark read, mark all read
- [x] Database seeder (4 users + 5 medicines)
- [x] Socket.IO setup for realtime

### Phase 2 - Frontend Pages ✅ COMPLETED

- [x] Login page (email/password form, JWT storage)
- [x] Dashboard layout (role-based sidebar navigation)
- [x] Dashboard home (stats cards)
- [x] Reception page
  - Patient registration form (name, phone, gender, DOB, email, address)
  - Patient search with live filtering
  - Appointment booking dialog (select patient + doctor)
  - Auto token generation per doctor per day
  - Today's appointments list with status badges
  - Quick "Book" button on each patient card
- [x] Doctor page
  - Today's patient queue with token numbers
  - Consultation dialog (diagnosis, notes)
  - Prescription builder (add/remove medicine items with dosage, duration, instructions)
  - Auto-saves consultation + prescription in one flow
- [x] Pharmacy page
  - Medicine list with search
  - Add new medicine dialog
  - Update stock dialog
  - New sale/billing dialog (select patient, add items, live total, stock deduction)
  - Low stock warning badges
- [x] Notifications page
  - Notification list with read/unread status
  - Mark individual or all as read
  - Unread count display
- [x] Admin user management page
  - Staff list with role badges
  - Add new user dialog
  - Activate/deactivate accounts
- [x] Fixed `/users/doctors` endpoint accessible to all authenticated users
- [x] Added `GET /api/appointments` for today's all appointments

### Phase 3 - Polish ✅ COMPLETED

- [x] Dashboard analytics (revenue charts, patient count, appointments today)
  - Created `DashboardAnalytics` component with Recharts
  - Weekly revenue line chart
  - Monthly appointments & patients bar chart
  - Stats cards with loading states
- [x] Search and filtering improvements
  - Enhanced search in reception page
  - Filtering in reports and sales pages
- [x] Form validation improvements (client-side with Zod)
  - Created validation schemas for patients, appointments, medicines, consultations
  - Type-safe form validation
- [x] Error handling UI (toast notifications)
  - Created `ToastProvider` component
  - Created `useToast` hook
  - Integrated react-hot-toast
- [x] Loading states and skeleton screens
  - Created `StatsCardSkeleton`, `TableRowSkeleton`, `CardSkeleton`, `ChartSkeleton`
  - Loading states in all data-fetching components
- [x] Responsive design for mobile
  - Added mobile sidebar with hamburger menu
  - Responsive padding and grid layouts
  - Mobile-friendly navigation

### Phase 4 - Advanced Features ✅ COMPLETED

- [x] Low stock alerts via Socket.IO
  - Backend: Emits low-stock alerts when medicine stock < 10 after sales
  - Frontend: Created `useSocket` hook for real-time alerts
- [x] Bill/invoice PDF generation
  - Created `generateInvoice` function with jsPDF
  - Professional invoice layout with hospital branding
  - Downloadable PDF invoices
- [x] Print prescriptions
  - Created `generatePrescription` function with jsPDF
  - Includes patient details, diagnosis, medicines table
  - Downloadable prescription PDFs
- [x] Appointment history and reporting
  - Created `/dashboard/reports` page
  - Filter by doctor, date range
  - Shows consultation details and prescriptions
- [x] Sales history and reports
  - Created `/dashboard/sales` page
  - Filter by date range
  - Download invoices for each sale
  - Revenue statistics

### Phase 5 - Future (PENDING)

- [ ] Lab module (test orders, results)
- [ ] SMS notifications
- [ ] WhatsApp integration
- [ ] AI integrations
- [ ] OCR prescription reading
- [ ] Multi-branch support
- [ ] Analytics dashboard with charts

---

## How to Run

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Supabase)

### Setup

```bash
# Clone
git clone https://github.com/srinu525/HM.git
cd HM

# Server
cd server
npm install
# Edit .env with your DATABASE_URL
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev

# Client (new terminal)
cd client
npm install
npm run dev
```

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | doctor@hospital.com | doctor123 |
| Receptionist | receptionist@hospital.com | receptionist123 |
| Pharmacist | pharmacist@hospital.com | pharmacist123 |

---

## Key Design Decisions

1. **Prisma 7 with driver adapter** - Uses `@prisma/adapter-pg` for PostgreSQL connections
2. **ESM modules** - Server uses ES modules (`"type": "module"` in package.json)
3. **Socket.IO** - Ready for realtime notifications (connected in `app.ts`)
4. **Role-based middleware** - `authorize("ADMIN", "DOCTOR")` pattern on routes
5. **Auto token generation** - Appointment tokens auto-increment per doctor per day
6. **Stock deduction** - Pharmacy sales auto-deduct medicine stock with validation
7. **Role-based sidebar** - Different navigation menus per role
8. **API interceptors** - Auto-attach JWT, auto-logout on 401

---

## File Summary

### Server Files (26 files)

| File | Purpose |
|------|---------|
| `src/app.ts` | Express + Socket.IO entry point, all route mounting |
| `src/config/index.ts` | Environment variable config |
| `src/middleware/auth.ts` | JWT authenticate + role authorize middleware |
| `src/middleware/errorHandler.ts` | Global error handler |
| `src/modules/auth/service.ts` | Login, register, profile with JWT |
| `src/modules/auth/controller.ts` | Auth request handlers |
| `src/modules/auth/routes.ts` | Auth route definitions |
| `src/modules/users/service.ts` | User CRUD + get doctors |
| `src/modules/users/controller.ts` | User request handlers |
| `src/modules/users/routes.ts` | User route definitions |
| `src/modules/patients/service.ts` | Patient CRUD with search |
| `src/modules/patients/controller.ts` | Patient request handlers |
| `src/modules/patients/routes.ts` | Patient route definitions |
| `src/modules/appointments/service.ts` | Appointment + token + queue |
| `src/modules/appointments/controller.ts` | Appointment request handlers |
| `src/modules/appointments/routes.ts` | Appointment route definitions |
| `src/modules/consultations/service.ts` | Consultation creation |
| `src/modules/consultations/controller.ts` | Consultation request handlers |
| `src/modules/consultations/routes.ts` | Consultation route definitions |
| `src/modules/pharmacy/service.ts` | Medicines, sales, prescriptions |
| `src/modules/pharmacy/controller.ts` | Pharmacy request handlers |
| `src/modules/pharmacy/routes.ts` | Pharmacy route definitions |
| `src/modules/notifications/service.ts` | Notification CRUD |
| `src/modules/notifications/controller.ts` | Notification request handlers |
| `src/modules/notifications/routes.ts` | Notification route definitions |
| `src/utils/prisma.ts` | Prisma client singleton |

### Client Files (14 key files)

| File | Purpose |
|------|---------|
| `lib/api.ts` | Axios client + typed API functions for all endpoints |
| `contexts/auth-context.tsx` | Auth state management (login, logout, user) |
| `components/providers.tsx` | Auth provider wrapper |
| `app/layout.tsx` | Root layout with fonts and providers |
| `app/page.tsx` | Home redirect to login |
| `app/login/page.tsx` | Login form with error handling |
| `app/dashboard/layout.tsx` | Dashboard layout with role-based sidebar |
| `app/dashboard/page.tsx` | Dashboard home with stats cards |
| `app/dashboard/users/page.tsx` | Admin user management (add, toggle active) |
| `app/reception/page.tsx` | Patient registration, search, appointment booking |
| `app/doctor/page.tsx` | Patient queue, consultation, prescription builder |
| `app/pharmacy/page.tsx` | Medicine list, stock management, billing/sales |
| `app/notifications/page.tsx` | Notification list with read/unread |
