# Hospital ADMIN Role Analysis & Recommendations

## Current Situation

### Problem Identified
The current **ADMIN** role is an **overpowered super-user** within the organization with access to EVERY operational function:

- ✅ Reception duties (patient registration, appointments, queue)
- ✅ Doctor duties (consultations, prescriptions)
- ✅ Pharmacy duties (inventory, sales, prescriptions)
- ✅ Lab duties (tests, results)
- ✅ Finance (invoices, payments)
- ✅ Reports
- ✅ User management
- ✅ Audit logs

**This is wrong.** ADMIN should not be performing reception, medical, or pharmacy tasks.

---

## Recommended Role Architecture

### Role Hierarchy & Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│ SUPER_ADMIN (Platform Owner)                                │
│ • Manages ALL organizations                                 │
│ • System-wide configuration                                 │
│ • Platform billing & subscriptions                          │
│ • System-wide analytics                                     │
└─────────────────────────────────────────────────────────────┘
                          ↑
                          │ manages
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ ADMIN (Hospital Administrator)                              │
│ • Manages staff users & roles                               │
│ • Configures organization settings                          │
│ • Views audit logs & compliance                             │
│ • Handles billing/subscription                              │
│ • Generates reports & analytics                             │
│ • Resolves issues & overrides                               │
│ • NOT involved in daily operations                          │
└─────────────────────────────────────────────────────────────┘
                          ↑
          ┌───────────────┼───────────────┐
          ↓               ↓               ↓
┌─────────────────┐ ┌─────────────┐ ┌────────────────┐
│ RECEPTIONIST    │ │   DOCTOR    │ │  PHARMACIST    │
│ • Register      │ │ • View      │ │ • Inventory    │
│   patients      │ │   patients  │ │   management   │
│ • Schedule      │ │ • Consult   │ │ • Process      │
│   appointments  │ │ • Prescribe │ │   sales        │
│ • Manage queue  │ │ • Lab       │ │ • Dispense     │
│ • Create        │ │   results   │ │   medicines    │
│   invoices      │ │             │ │                │
└─────────────────┘ └─────────────┘ └────────────────┘
                          ↑
                          │
                    ┌─────┴─────┐
                    │ PATIENT   │
                    │ • View    │
                    │   own     │
                    │   records │
                    └───────────┘
```

---

## Detailed Role Definitions

### 1. SUPER_ADMIN (Platform Administrator)
**Scope:** System-wide (all organizations)

**Responsibilities:**
- Create and manage organizations
- View system-wide statistics
- Manage subscription plans
- Configure platform settings
- Monitor system health
- Access all organizations' data for support

**Access:**
- `/admin/*` routes
- Organization management
- Plan management
- System analytics
- Feature flags

---

### 2. ADMIN (Hospital Administrator) ⭐ **FOCUS OF THIS DOC**
**Scope:** Single organization

**Core Responsibilities:**

#### A. User & Role Management
- Create staff accounts (receptionists, doctors, pharmacists)
- Assign roles to users
- Disable/enable user accounts
- Reset passwords
- View user activity

#### B. Organization Configuration
- Hospital/clinic information (name, address, contact)
- Working hours & holidays
- Token numbering system
- Currency & language preferences
- Logo & branding
- Feature flags (enable/disable modules)

#### C. Audit & Compliance
- View audit logs (who did what, when)
- Track data changes
- Export compliance reports
- Monitor suspicious activities

#### D. Financial Oversight
- View subscription plan & billing
- Upgrade/downgrade plans
- View payment history
- Generate financial reports
- **NOT** create invoices or process payments (receptionist job)

#### E. Reports & Analytics
- Organizational performance reports
- Staff productivity metrics
- Patient statistics
- Revenue analytics
- Appointment trends

#### F. Issue Resolution
- Override permissions in emergencies
- Resolve data conflicts
- Handle escalated issues
- Access locked records

#### G. System Monitoring
- View system health metrics
- Check backup status
- Monitor storage usage
- Review error logs

**What ADMIN Should NOT Do:**
- ❌ Register patients (receptionist job)
- ❌ Book appointments (receptionist job)
- ❌ Consult patients (doctor job)
- ❌ Dispense medicines (pharmacist job)
- ❌ Conduct lab tests (lab technician job)
- ❌ Create invoices (receptionist job)

---

### 3. RECEPTIONIST
**Scope:** Front desk operations

**Responsibilities:**
- Register new patients
- Book appointments
- Manage appointment queue
- Check-in patients
- Create invoices
- Process payments
- View patient list

**Access:**
- `/dashboard/reception/*`
- `/dashboard/invoices`
- `/dashboard/patients`

---

### 4. DOCTOR
**Scope:** Medical consultations

**Responsibilities:**
- View patient list
- Conduct consultations
- Write prescriptions
- Order lab tests
- Review lab results
- View own queue
- View own appointments

**Access:**
- `/dashboard/doctor`
- `/dashboard/reception/patients` (view only)
- `/dashboard/reception/queue` (own queue)
- `/dashboard/pharmacy/prescriptions` (own prescriptions)
- `/dashboard/lab` (view tests & results)

---

### 5. PHARMACIST
**Scope:** Pharmacy operations

**Responsibilities:**
- Manage medicine inventory
- Process sales
- Fulfill prescriptions
- Update stock levels
- View low-stock alerts
- Track expiry dates

**Access:**
- `/dashboard/pharmacy/*`
- `/dashboard/lab` (view only)

---

### 6. PATIENT
**Scope:** Own records only

**Responsibilities:**
- View own appointments
- View own prescriptions
- View own lab results
- View own invoices
- Update own profile

**Access:**
- `/patient/*`

---

## Current vs. Recommended ADMIN Access

### Current ADMIN Access (❌ TOO BROAD)

| Module | Current Access | Recommended Access |
|--------|---------------|-------------------|
| Reception | ✅ Full access | ❌ No access |
| Patients | ✅ Create/Edit | ✅ View only (for reference) |
| Appointments | ✅ Full access | ❌ No access |
| Doctor | ✅ Full access | ❌ No access |
| Pharmacy | ✅ Full access | ❌ No access |
| Lab | ✅ Full access | ❌ No access |
| Invoices | ✅ Full access | ✅ View only |
| Sales | ✅ Full access | ✅ View only |
| Reports | ✅ Access | ✅ Access |
| Users | ✅ Access | ✅ Full access (primary job) |
| Audit Logs | ✅ Access | ✅ Access (primary job) |
| Billing | ✅ Access | ✅ Access (primary job) |
| Organizations | ✅ Access | ❌ SUPER_ADMIN only |

---

## Required Features for ADMIN Role

### 1. User Management Module
**Routes:**
- `GET /users` - List all staff users
- `POST /users` - Create new staff account
- `GET /users/:id` - View user details
- `PUT /users/:id` - Update user (name, email, role)
- `PUT /users/:id/disable` - Disable account
- `PUT /users/:id/enable` - Enable account
- `POST /users/:id/reset-password` - Send password reset

**UI Pages:**
- `/dashboard/users` - User list with filters
- `/dashboard/users/create` - Create user dialog
- `/dashboard/users/:id/edit` - Edit user dialog

---

### 2. Organization Settings Module
**Routes:**
- `GET /organizations/:id` - Get org details
- `PUT /organizations/:id` - Update org settings
- `GET /organizations/:id/settings` - Get org settings
- `PUT /organizations/:id/settings` - Update settings

**Settings to Configure:**
- Hospital name, address, phone, email
- Working hours (start/end time, holidays)
- Token prefix & numbering
- Currency (INR, USD, etc.)
- Language (English, Hindi, etc.)
- Logo upload
- Timezone
- Appointment duration (default)
- Consultation fee (default)

**UI Pages:**
- `/dashboard/settings` - Organization settings form
- `/dashboard/settings/working-hours` - Working hours configuration
- `/dashboard/settings/appearance` - Logo & branding

---

### 3. Audit Logs Module (Enhanced)
**Routes:**
- `GET /audit-logs` - List logs with filters
  - Query params: `userId`, `action`, `entity`, `startDate`, `endDate`, `page`, `limit`
- `GET /audit-logs/:id` - View log details
- `GET /audit-logs/export` - Export to CSV/PDF

**Filters:**
- By user
- By action (CREATE, UPDATE, DELETE)
- By entity (Patient, Appointment, Medicine, etc.)
- By date range
- By IP address

**UI Pages:**
- `/dashboard/audit-logs` - Log viewer with filters
- `/dashboard/audit-logs/:id` - Log detail view

---

### 4. Reports & Analytics Module
**Routes:**
- `GET /reports/patients` - Patient statistics
  - Filters: `startDate`, `endDate`, `doctorId`
- `GET /reports/appointments` - Appointment reports
  - Filters: `startDate`, `endDate`, `doctorId`, `status`
- `GET /reports/revenue` - Revenue reports
  - Filters: `startDate`, `endDate`
- `GET /reports/staff` - Staff performance
  - Filters: `startDate`, `endDate`, `role`
- `GET /reports/inventory` - Inventory reports
- `GET /reports/export` - Export to CSV/PDF

**UI Pages:**
- `/dashboard/reports` - Reports dashboard
- `/dashboard/reports/patients` - Patient statistics
- `/dashboard/reports/appointments` - Appointment analytics
- `/dashboard/reports/revenue` - Revenue analytics
- `/dashboard/reports/staff` - Staff performance

---

### 5. Role Management Module (Advanced)
**Routes:**
- `GET /roles` - List all roles
- `GET /roles/:id` - View role details
- `PUT /roles/:id/permissions` - Update role permissions

**Permissions System:**
```typescript
interface Permission {
  id: string;
  name: string; // "patients.create", "appointments.view", etc.
  module: string; // "patients", "appointments", etc.
  action: string; // "create", "read", "update", "delete"
}

interface Role {
  id: string;
  name: string; // "RECEPTIONIST", "DOCTOR", etc.
  permissions: Permission[];
}
```

**UI Pages:**
- `/dashboard/roles` - Role list
- `/dashboard/roles/:id` - Role permissions editor

---

### 6. Feature Flags Module
**Routes:**
- `GET /feature-flags` - List all feature flags
- `PUT /feature-flags/:id` - Enable/disable feature

**Features to Control:**
- Enable/disable lab module
- Enable/disable pharmacy module
- Enable/disable invoice module
- Enable patient portal
- Enable online appointments
- Enable SMS notifications
- Enable email notifications

**UI Pages:**
- `/dashboard/feature-flags` - Feature flags toggle list

---

### 7. Subscription & Billing Module
**Routes:**
- `GET /subscription/current` - Current plan details
- `GET /subscription/history` - Payment history
- `POST /subscription/upgrade` - Upgrade plan
- `POST /subscription/cancel` - Cancel subscription
- `GET /invoices` - View invoices
- `GET /invoices/:id/pdf` - Download invoice PDF

**UI Pages:**
- `/dashboard/billing` - Current plan & usage
- `/dashboard/billing/history` - Payment history
- `/dashboard/billing/upgrade` - Upgrade plan

---

### 8. System Monitoring Dashboard
**Routes:**
- `GET /system/health` - System health status
- `GET /system/metrics` - System metrics
- `GET /system/backups` - Backup status
- `GET /system/logs` - Error logs

**Metrics to Display:**
- Database connection status
- Storage usage
- API response times
- Active users count
- Backup status (last backup, next backup)
- Error rate

**UI Pages:**
- `/dashboard/system` - System health dashboard

---

## Implementation Plan

### Phase 1: Remove Excess Access (Immediate)
1. Update `route-guard.tsx` - Remove ADMIN from reception, doctor, pharmacy, lab routes
2. Update server routes - Remove ADMIN from operational route authorizations
3. Update `dashboard/layout.tsx` - Remove operational links from ADMIN sidebar

### Phase 2: Build User Management (Week 1)
1. Create user management UI
2. Add user CRUD routes
3. Add password reset functionality
4. Add user activity tracking

### Phase 3: Build Organization Settings (Week 2)
1. Create settings UI
2. Add settings routes
3. Implement logo upload
4. Add working hours configuration

### Phase 4: Enhance Audit Logs (Week 3)
1. Add advanced filters
2. Add export functionality
3. Create audit log UI
4. Add log detail view

### Phase 5: Build Reports Module (Week 4)
1. Create reports dashboard
2. Add report generation routes
3. Add export functionality
4. Create report UI pages

### Phase 6: Advanced Features (Week 5-6)
1. Role management UI
2. Feature flags UI
3. System monitoring dashboard
4. Subscription management UI

---

## Migration Strategy

### For Existing ADMIN Users
1. **Communicate** the role change to all ADMIN users
2. **Reassign** operational tasks to appropriate roles:
   - If ADMIN was doing reception work → Assign RECEPTIONIST role
   - If ADMIN was doing doctor work → Assign DOCTOR role
   - If ADMIN was doing pharmacy work → Assign PHARMACIST role
3. **Keep** ADMIN role for administrative tasks only
4. **Provide** training on new ADMIN responsibilities

### Backward Compatibility
- Keep old routes functional for 1 month with deprecation warnings
- Log when ADMIN accesses restricted routes
- Show warning message: "This feature will be moved to appropriate role in next update"

---

## Benefits of This Change

### Security
- ✅ Principle of least privilege
- ✅ Reduced attack surface
- ✅ Better audit trail
- ✅ Separation of duties

### Maintainability
- ✅ Clear role definitions
- ✅ Easier to debug issues
- ✅ Simpler permission management
- ✅ Better code organization

### Compliance
- ✅ HIPAA/GDPR friendly
- ✅ Clear accountability
- ✅ Audit trail integrity
- ✅ Role-based access control (RBAC) best practices

### User Experience
- ✅ Cleaner, focused dashboards
- ✅ Less clutter for each role
- ✅ Clearer responsibilities
- ✅ Better onboarding for new staff

---

## Summary

**Current Problem:** ADMIN is a jack-of-all-trades with too much access.

**Solution:** ADMIN should be a **pure administrative role** focused on:
1. User & role management
2. Organization configuration
3. Audit & compliance
4. Reports & analytics
5. Issue resolution

**Operational tasks** (reception, doctor, pharmacy, lab) should be handled by their respective specialized roles.

**Next Steps:**
1. Get stakeholder approval for role restructuring
2. Implement Phase 1 (remove excess access)
3. Implement Phases 2-6 (build proper ADMIN features)
4. Migrate existing ADMIN users
5. Train staff on new role structure