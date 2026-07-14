# HM - Hospital Management System

A scalable Hospital Management System built with modern web technologies.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Express.js, TypeScript, Prisma 7 ORM, JWT Auth, Socket.IO |
| Database | PostgreSQL (via Supabase or local) |

---

## Architecture

```
Next.js Frontend (port 3000)
        |
Express.js Backend API (port 5000)
        |
PostgreSQL Database
```

---

## User Roles

| Role | Access |
|------|--------|
| ADMIN | Full access - manage users, view all modules |
| RECEPTIONIST | Patient registration, appointment booking |
| DOCTOR | Patient queue, consultations, prescriptions |
| PHARMACIST | Medicine management, billing, stock |

---

## Project Structure

```
HM/
├── client/                         # Next.js frontend
│   ├── app/
│   │   ├── login/page.tsx          # Login page
│   │   ├── dashboard/
│   │   │   ├── layout.tsx          # Dashboard layout with role-based sidebar
│   │   │   ├── page.tsx            # Dashboard home with stats
│   │   │   └── users/page.tsx      # Admin user management
│   │   ├── reception/page.tsx      # Patient registration & appointments
│   │   ├── doctor/page.tsx         # Queue, consultations & prescriptions
│   │   ├── pharmacy/page.tsx       # Medicines, stock & billing
│   │   └── notifications/page.tsx  # Notification center
│   ├── components/
│   │   ├── providers.tsx           # Auth provider wrapper
│   │   └── ui/                     # shadcn/ui components
│   ├── contexts/
│   │   └── auth-context.tsx        # Auth state management
│   └── lib/
│       ├── api.ts                  # Axios API client with typed functions
│       └── utils.ts                # Utility functions
│
├── server/                         # Express backend
│   ├── src/
│   │   ├── app.ts                  # Entry point + Socket.IO setup
│   │   ├── config/index.ts         # Environment config
│   │   ├── middleware/
│   │   │   ├── auth.ts             # JWT auth + role authorization
│   │   │   └── errorHandler.ts     # Global error handler
│   │   ├── modules/
│   │   │   ├── auth/               # Login, register, profile
│   │   │   ├── users/              # User CRUD (admin only)
│   │   │   ├── patients/           # Patient registration & search
│   │   │   ├── appointments/       # Token generation, queue, status
│   │   │   ├── consultations/      # Doctor consultations
│   │   │   ├── pharmacy/           # Medicines, sales, prescriptions
│   │   │   └── notifications/      # Notification management
│   │   ├── utils/prisma.ts         # Prisma client singleton
│   │   └── seed.ts                 # Database seeder
│   ├── prisma/
│   │   └── schema.prisma           # Database schema (10 tables)
│   ├── prisma.config.ts            # Prisma CLI config
│   └── .env                        # Environment variables
│
└── README.md
```

---

## Database Schema

### Tables (10)

| Table | Description |
|-------|-------------|
| `users` | Staff accounts (admin, receptionist, doctor, pharmacist) |
| `patients` | Patient records (name, phone, gender, dob, address) |
| `appointments` | Booked appointments with auto-generated token numbers |
| `consultations` | Doctor consultation notes and diagnosis |
| `prescriptions` | Prescriptions linked to consultations |
| `prescription_items` | Individual medicine items in a prescription |
| `medicines` | Medicine catalog with price and stock levels |
| `sales` | Billing/sales records with total |
| `sale_items` | Individual items in a sale with quantity and price |
| `notifications` | User notifications with read/unread status |

### Enums

- `Role`: ADMIN, RECEPTIONIST, DOCTOR, PHARMACIST
- `AppointmentStatus`: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- `Gender`: MALE, FEMALE, OTHER

---

## API Endpoints (21 total)

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get JWT | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/doctors` | List all active doctors | Yes |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user / toggle active | Admin |

### Patients

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/patients?search=` | Search patients by name/phone/email | Yes |
| GET | `/api/patients/:id` | Get patient with history | Yes |
| POST | `/api/patients` | Register new patient | Receptionist |
| PUT | `/api/patients/:id` | Update patient details | Receptionist |

### Appointments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/appointments` | Create appointment (auto token per doctor/day) | Receptionist |
| GET | `/api/appointments` | Get today's all appointments | Yes |
| GET | `/api/appointments/doctor/:doctorId` | Get doctor's daily appointments | Yes |
| GET | `/api/appointments/queue/:doctorId` | Get pending queue for doctor | Doctor |
| PUT | `/api/appointments/:id/status` | Update appointment status | Yes |

### Consultations

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/consultations` | Create consultation (marks appointment completed) | Doctor |
| GET | `/api/consultations` | Get my recent consultations | Doctor |

### Pharmacy

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pharmacy/medicines?search=` | Search medicines | Yes |
| POST | `/api/pharmacy/medicines` | Add new medicine | Pharmacist |
| PUT | `/api/pharmacy/medicines/:id/stock` | Update stock quantity | Pharmacist |
| POST | `/api/pharmacy/sales` | Create sale (auto stock deduction + validation) | Pharmacist |
| GET | `/api/pharmacy/sales` | Get all sales | Yes |
| POST | `/api/pharmacy/prescriptions` | Create prescription with items | Doctor |

### Notifications

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get my notifications | Yes |
| PUT | `/api/notifications/:id/read` | Mark single notification as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all notifications as read | Yes |

---

## Frontend Pages (6 pages)

### Login (`/login`)
- Email/password form
- JWT token stored in localStorage
- Auto redirect to dashboard

### Dashboard (`/dashboard`)
- Stats cards (placeholder for analytics)
- Role-based sidebar navigation

### Reception (`/dashboard/reception`)
- Patient registration dialog (name, phone, gender, DOB, email, address)
- Patient search with live filtering
- Appointment booking dialog (select patient + doctor, auto token)
- Today's appointments list with status badges
- Quick "Book" button on each patient card

### Doctor (`/dashboard/doctor`)
- Today's patient queue with token numbers
- Consultation dialog with:
  - Diagnosis input
  - Clinical notes
  - Prescription builder (add/remove medicine items)
  - Dosage, duration, and instructions per medicine
  - Auto-saves consultation + prescription in one flow

### Pharmacy (`/dashboard/pharmacy`)
- Medicine list with search
- Add new medicine dialog (name, description, price, stock)
- Update stock dialog
- New sale/billing dialog:
  - Select patient
  - Add multiple medicine items
  - Live total calculation
  - Auto stock deduction with validation
- Low stock warning badges (red when stock < 10)

### Notifications (`/dashboard/notifications`)
- Notification list with read/unread status
- Mark individual or all as read
- Unread count in header

### User Management (`/dashboard/users`) - Admin only
- Staff list with role badges (color-coded)
- Add new user dialog (name, email, password, role, phone)
- Activate/deactivate accounts

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database (local or Supabase)
- npm or yarn

### 1. Clone & Install

```bash
git clone https://github.com/srinu525/HM.git
cd HM

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Database

Edit `server/.env` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/hospital_db"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
```

### 3. Setup Database

```bash
cd server

# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Seed default users and medicines
npm run db:seed
```

### 4. Run the App

```bash
# Terminal 1 - Start backend (port 5000)
cd server
npm run dev

# Terminal 2 - Start frontend (port 3000)
cd client
npm run dev
```

### 5. Open Browser

- Frontend: http://localhost:3000
- Login with any test account below

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | doctor@hospital.com | doctor123 |
| Receptionist | receptionist@hospital.com | receptionist123 |
| Pharmacist | pharmacist@hospital.com | pharmacist123 |

---

## Complete Workflow

1. **Receptionist** logs in → registers patient → books appointment (auto token generated)
2. **Doctor** logs in → sees patient queue → clicks "Consult" → enters diagnosis → adds prescription → completes consultation
3. **Pharmacist** logs in → sees prescriptions → creates sale → processes billing (auto stock deduction)
4. **Admin** logs in → manages staff accounts → views all data

---

## Development Status

### Phase 1 - Core Setup ✅

- [x] Project scaffolding (client + server)
- [x] Prisma schema with all 10 tables
- [x] Express server with middleware (CORS, Helmet, Morgan)
- [x] JWT authentication (login, register, profile)
- [x] Role-based authorization middleware
- [x] User management CRUD (admin only)
- [x] All backend API endpoints (21 routes)
- [x] Database seeder with test data
- [x] Socket.IO setup for realtime

### Phase 2 - Frontend Pages ✅

- [x] Login page with form validation
- [x] Dashboard layout with role-based sidebar navigation
- [x] Reception page (patient registration, search, appointment booking)
- [x] Doctor page (queue, consultation, prescription builder)
- [x] Pharmacy page (medicine management, stock, billing/sales)
- [x] Notifications page (read/unread, mark as read)
- [x] Admin user management page (add, activate/deactivate)

### Phase 3 - Polish (Pending)

- [ ] Dashboard analytics (charts, stats, revenue)
- [ ] Search and filtering improvements
- [ ] Form validation improvements (client-side)
- [ ] Error handling UI (toast notifications)
- [ ] Loading states and skeleton screens
- [ ] Responsive design for mobile

### Phase 4 - Advanced Features (Pending)

- [ ] Low stock alerts via Socket.IO
- [ ] Bill/invoice PDF generation
- [ ] Print prescriptions
- [ ] Appointment history and reporting

### Phase 5 - Future (Pending)

- [ ] Lab module
- [ ] SMS / WhatsApp integration
- [ ] AI integrations
- [ ] OCR prescription reading
- [ ] Multi-branch support
- [ ] Analytics dashboard with charts

---

## Future Enhancements

- Lab module
- SMS / WhatsApp integration
- AI integrations
- OCR prescription reading
- Multi-branch support
- Analytics dashboard with charts
