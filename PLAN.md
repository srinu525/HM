# Hospital Management System - Implementation Plan

## Current State Summary

### Frontend (Next.js 16 + React + shadcn/ui + Tailwind v4)
- **5 role-based dashboards** scaffolded: admin, doctor, reception, pharmacist, nurse
- **Sidebar navigation** with links to pages that **don't exist yet**
- **Analytics page** at `analytics/page.tsx` uses **mock/hardcoded data**
- **No login page redesign** — basic form with email/password
- **No top navigation bar** — only sidebar toggle + logo in header
- **Reception & Pharmacy pages** have inline dialogs but no dedicated sub-pages

### Backend (Express + Prisma + PostgreSQL)
- Full REST API for: auth, users, patients, appointments, consultations, pharmacy, notifications, stats
- Socket.IO integrated for real-time notifications
- Stats endpoints return real data from DB
- **Missing endpoints**: prescription listing, general appointment listing, patient search

---

## Features to Implement

### 1. Login Page Redesign
**File**: `client/app/(auth)/login/page.tsx`
- Split layout: branded left panel + form right panel
- Hospital logo/name prominently displayed
- Input icons (Mail, Lock), form validation, loading spinner
- Subtle animated background gradient
- Keep existing `useAuth().login()` integration

### 2. Top Navigation Bar
**Files**: `client/components/dashboard-header.tsx`, `client/app/dashboard/layout.tsx`
- Dynamic page title/breadcrumb (left)
- Notification bell with unread count badge + dropdown (right)
- User avatar/name dropdown with role badge, profile, logout (right)
- Uses `notificationApi.getAll()` + Socket.IO for real-time updates
- New components: `notification-bell.tsx`, `user-menu.tsx`

### 3. Dashboard Analytics (Real Data)
**Files**: `client/components/dashboard-analytics.tsx`, `client/app/dashboard/analytics/page.tsx`
- Replace all mock data with API calls to `/api/stats` and `/api/stats/analytics`
- Role-aware card visibility (pharmacy stats for PHARMACIST, revenue for ADMIN)
- Loading skeletons, refresh button functional
- Pass user role from `useAuth()` into `DashboardAnalytics`

### 4. Reception Sub-Pages (4 new pages)
All under `client/app/dashboard/reception/`:

| Page | Route | Description |
|------|-------|-------------|
| Patient Registration | `/reception/patients` | Full registration form, search existing patients, recent list |
| New Appointment | `/reception/appointments` | Step-by-step: patient -> doctor -> date -> validity -> confirm |
| Queue View | `/reception/queue` | Real-time queue with status indicators, auto-refresh via Socket.IO |
| Appointments List | `/reception/appointments-list` | Filterable table by date/doctor/status, export |

### 5. Pharmacy Sub-Pages (3 new pages)
All under `client/app/dashboard/pharmacy/`:

| Page | Route | Description |
|------|-------|-------------|
| Medicine Inventory | `/pharmacy/inventory` | Table with search/filter, add/edit dialog, low stock alerts |
| Sales | `/pharmacy/sales` | Sales history, new sale dialog, receipt generation, revenue summary |
| Prescriptions | `/pharmacy/prescriptions` | List all prescriptions, view details, print, date/patient/doctor filters |

### 6. Backend Endpoints to Add

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/pharmacy/prescriptions` | GET | List all prescriptions with filters |
| `/api/pharmacy/prescriptions/:id` | GET | Prescription detail with items + medicine names |
| `/api/appointments` | GET | General listing with date/doctor/status filters |
| `/api/patients` | GET | Search patients by name/phone |

---

## Implementation Order

| Step | Feature | Dependencies |
|------|---------|-------------|
| 1 | Login page redesign | None |
| 2 | Top navigation bar | Modifies shared layout |
| 3 | Analytics data integration | Modifies shared component |
| 4 | Backend new endpoints | Required by steps 5-6 |
| 5 | Reception sub-pages (4) | Backend endpoints |
| 6 | Pharmacy sub-pages (3) | Backend endpoints |

---

## Files Reference

### Key Existing Files
- `client/app/(auth)/login/page.tsx` — Login page (to redesign)
- `client/app/dashboard/layout.tsx` — Dashboard layout with sidebar
- `client/components/dashboard-header.tsx` — Header (logo + toggle only)
- `client/components/dashboard-analytics.tsx` — Analytics component (mock data)
- `client/app/dashboard/analytics/page.tsx` — Analytics page
- `client/lib/api.ts` — API client with all endpoints
- `client/contexts/auth-context.tsx` — Auth context with role-based access
- `server/src/modules/*/service.ts` — All backend services
- `server/src/modules/*/routes.ts` — All backend routes
- `server/prisma/schema.prisma` — Database schema

### New Files to Create
- `client/components/notification-bell.tsx`
- `client/components/user-menu.tsx`
- `client/app/dashboard/reception/patients/page.tsx`
- `client/app/dashboard/reception/appointments/page.tsx`
- `client/app/dashboard/reception/queue/page.tsx`
- `client/app/dashboard/reception/appointments-list/page.tsx`
- `client/app/dashboard/pharmacy/inventory/page.tsx`
- `client/app/dashboard/pharmacy/sales/page.tsx`
- `client/app/dashboard/pharmacy/prescriptions/page.tsx`
