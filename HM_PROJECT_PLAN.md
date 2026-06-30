# HM - Hospital Management System

## Project Overview

HM is a modern Hospital Management System built with:

- Frontend: Next.js + TypeScript
- Backend: Express.js + TypeScript
- Database: PostgreSQL (Supabase)
- ORM: Prisma
- Realtime Notifications: Socket.IO

The system is designed to support:

- Reception workflow
- Doctor workflow
- Pharmacy workflow
- Notifications
- Role-based access
- Future scalability

---

# Planned Modules

## 1. Reception Module

Features:
- Patient registration
- Patient search
- Appointment booking
- Token generation
- Queue management

---

## 2. Doctor Module

Features:
- Patient queue
- Consultation notes
- Diagnosis
- Prescription generation

---

## 3. Pharmacy Module

Features:
- Prescription lookup
- Medicine billing
- Stock deduction
- Invoice generation

---

## 4. Notification Module

Realtime notifications using Socket.IO.

Examples:
- Appointment created
- Doctor consultation completed
- Billing completed
- Low medicine stock alerts

---

# Recommended Architecture

```text
Next.js Frontend
        ↓
Express.js Backend API
        ↓
PostgreSQL (Supabase)
```

---

# Recommended Tech Stack

## Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Express.js
- Prisma ORM
- JWT Authentication
- Socket.IO

## Database
- PostgreSQL (Supabase)

---

# Repository Structure

```text
HM/
├── client/          # Next.js frontend
├── server/          # Express backend
├── docs/
└── README.md
```

---

# Backend Modules Structure

```text
server/src/modules/
├── auth/
├── patients/
├── appointments/
├── doctors/
├── pharmacy/
└── notifications/
```

---

# Frontend Pages Structure

```text
client/app/
├── login/
├── dashboard/
├── reception/
├── doctor/
├── pharmacy/
└── notifications/
```

---

# Authentication Roles

- ADMIN
- RECEPTIONIST
- DOCTOR
- PHARMACIST

---

# Planned Database Tables

- users
- roles
- patients
- appointments
- consultations
- prescriptions
- prescription_items
- medicines
- sales
- sale_items
- notifications

---

# Initial API Plan

```text
POST /auth/login
POST /patients
GET /patients
POST /appointments
GET /doctor/queue
POST /consultations
POST /prescriptions
POST /billing
GET /notifications
```

---

# Development Phases

## Phase 1
- Project setup
- Authentication
- Role system

## Phase 2
- Patient registration
- Appointment/token system

## Phase 3
- Doctor consultation
- Prescription module

## Phase 4
- Pharmacy billing
- Stock management

## Phase 5
- Notification system
- Dashboard analytics

---

# Future Enhancements

- Lab module
- SMS notifications
- WhatsApp integration
- AI integrations
- OCR prescription reading
- Multi-branch support
- Analytics dashboard

---

# Setup Plan

## Frontend Setup

```bash
npx create-next-app@latest client
```

Choose:
- TypeScript → Yes
- Tailwind → Yes
- App Router → Yes

---

## Backend Setup

```bash
mkdir HM
cd HM
npm init -y
```

Install packages:

```bash
npm install express cors dotenv prisma @prisma/client socket.io
npm install jsonwebtoken bcrypt
npm install -D typescript ts-node-dev @types/node @types/express
```

---

# Notes

- Use TypeScript across frontend and backend
- Keep business logic inside backend
- Use Prisma for database management
- Use Socket.IO for realtime updates
- Keep frontend modular and scalable
