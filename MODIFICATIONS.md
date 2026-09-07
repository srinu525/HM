# HM System — Modifications & Bug Fixes

> Generated: September 2, 2026  
> Status: All bugs below have been **fixed** in this session.

---

## Summary

Complete audit of all pages, auth flows, routing, and API calls revealed 8 bugs (3 critical, 5 medium) and several improvement suggestions. All critical and medium bugs are fixed below.

---

## Bugs Fixed

### 🔴 BUG-01 — User Registration Missing `organizationId` ✅ Fixed

**File:** `client/app/dashboard/admin/users/page.tsx`

**Problem:** `POST /auth/register` was called without `organizationId`. The server requires it as a mandatory field. Every "Add User" attempt from the dashboard failed with a 400/422 error.

**Fix:** Read `organizationId` from auth context (`useAuth().user.organizationId`) and include it in the request body.

---

### 🔴 BUG-02 — Super Admin Logout Redirects to Wrong Page ✅ Fixed

**File:** `client/contexts/auth-context.tsx` — `logout()` function

**Problem:** `logout()` always redirected to `/${savedSlug}/login`. For SUPER_ADMIN, no `orgSlug` was saved during `loginSuperAdmin()`, so fallback was `/default-hospital/login` — not the super admin login.

**Fix:** Save `userRole` to localStorage on all logins. `logout()` now checks the role and redirects to `/super-admin` for SUPER_ADMIN users.

---

### 🔴 BUG-03 — 401 Interceptor Redirects Super Admin to Wrong Login ✅ Fixed

**File:** `client/lib/api.ts` — `redirectToLogin()` function

**Problem:** Token expiry for a SUPER_ADMIN session triggered redirect to `/${savedSlug}/login`.

**Fix:** `redirectToLogin()` now reads `localStorage.userRole`. If `SUPER_ADMIN`, it redirects to `/super-admin` instead.

**Additional fix:** `isRedirecting` flag was never reset, silently swallowing all future 401s in the same browser tab. Now resets after 3 seconds.

---

### 🟡 BUG-04 — Patient Dashboard Uses `useAuth()` (Never Set for Patients) ✅ Fixed

**File:** `client/app/(patient)/patient/page.tsx`

**Problem:** Patient login bypasses `AuthContext` entirely — it writes directly to `localStorage` without calling `setUser()`. So `useAuth().user` was always `null` for patients.

**Fix:** Read patient from `localStorage` directly (matching the pattern already used in `(patient)/layout.tsx`). Removed the `useAuth()` import.

---

### 🟡 BUG-05 — `loginSuperAdmin()` Didn't Save `userRole` to localStorage ✅ Fixed

**File:** `client/contexts/auth-context.tsx`

**Problem:** Only `token` and `user` were saved. No role marker existed for the 401 interceptor or logout to detect super admin sessions.

**Fix:** All login functions now save `userRole` to localStorage. `loginSuperAdmin()` explicitly saves `"SUPER_ADMIN"`.

---

### 🟡 BUG-06 — Consultation Fee Shows `$` Instead of `₹` ✅ Fixed

**File:** `client/app/dashboard/appointments/page.tsx`

**Problem:** Fee displayed as `$X` throughout the system — should be `₹`.

**Fix:** Changed the symbol to `₹`.

---

### 🟡 BUG-07 — Dashboard Sidebar Visible Before Auth Resolves ✅ Fixed

**File:** `client/app/dashboard/layout.tsx`

**Problem:** The sidebar rendered immediately since `RouteGuard` only wrapped `{children}`, not the full layout. Users with expired tokens saw the full sidebar for ~100ms before being redirected.

**Fix:** Added a full-screen loading overlay that displays until `mounted && !isLoading`, preventing the sidebar from being visible before auth resolves.

---

### 🟡 BUG-08 — RouteGuard Didn't Handle Super Admin on Dashboard Routes ✅ Fixed

**File:** `client/components/route-guard.tsx`

**Problem:** If a super admin somehow landed on `/dashboard/*`, the RouteGuard redirected them to `/default-hospital/login` instead of `/admin`.

**Fix:** Added detection for `userRole === "SUPER_ADMIN"` in the unauthenticated redirect, and added an explicit redirect from `/dashboard/*` to `/admin` for super admin users.

---

## Improvements Suggested (Not Yet Implemented)

### IMPROVEMENT-01 — Add Next.js Middleware for Route Protection

Currently all auth checks are client-side. A `middleware.ts` at the Next.js root would allow server-side redirect before the page even renders, eliminating the auth flash entirely.

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  // Redirect unauthenticated users at the edge
}
```

### IMPROVEMENT-02 — Use HTTP-Only Cookies for JWT

Currently JWT is stored in `localStorage`, which is vulnerable to XSS. Moving to HTTP-only cookies would improve security significantly.

### IMPROVEMENT-03 — Add Patient Registration via Patient Portal

Currently patients must be registered by a Receptionist. There's no self-registration flow. A `/patient/register` page would improve onboarding.

### IMPROVEMENT-04 — Seed Default Permissions on Org Creation

When a new organization is created via Super Admin, default permissions are not automatically seeded. Staff users in a new org get 0 permissions until the admin manually runs `POST /api/v1/permissions/seed`. This should be automated on org creation.

### IMPROVEMENT-05 — Add Appointment Date Field

`POST /appointments` doesn't accept a date parameter — appointments always use `now()`. A date picker is needed for scheduling future appointments.

### IMPROVEMENT-06 — Dashboard Sidebar Role Filtering

The current sidebar shows all sections and relies on `hasModule()` checks. The sidebar config should be pre-filtered per role at the data level (not just hidden via conditionals) to simplify the logic and avoid showing/hiding flicker.

### IMPROVEMENT-07 — Add Refresh Token Support

JWT expires in 7 days. There's no refresh mechanism. Adding refresh tokens would avoid forcing re-logins after token expiry.

### IMPROVEMENT-08 — Error Boundaries on All Dashboard Pages

Pages like `/dashboard/patients` and `/dashboard/appointments` have no error boundaries. A network failure renders a blank page.

---

## Flow Documentation

### Staff Login Flow

```
Landing (/) → /default-hospital/login
  → POST /auth/login { email, password, organizationSlug }
  → Server: finds org by slug → finds user by (email + orgId) → validates password → returns JWT + permissions
  → Client: saves token + user to localStorage → router.push("/dashboard")
  → Dashboard layout hydrates from localStorage → RouteGuard validates → sidebar renders filtered by permissions
```

### Patient Login Flow

```
/patient/login
  → POST /patient/auth/login { email, password, organizationSlug }
  → Server: patientAuthenticate middleware (separate from staff auth)
  → Client: saves token + patient as user to localStorage → router.push("/patient")
  → Patient layout reads localStorage directly (bypasses AuthContext)
```

### Super Admin Login Flow

```
/super-admin
  → POST /auth/login-super-admin { email, password }
  → Server: finds user with role=SUPER_ADMIN (no org required)
  → Client: saves token + user (role=SUPER_ADMIN, organizationId=null) → router.push("/admin")
  → Admin layout uses its own RouteGuard (separate from dashboard)
```

### Organization Creation Flow

```
Super Admin → /admin/organizations → "New Organization" button
  → POST /admin/organizations { name, slug, email, phone, timezone, currency }
  → New org appears in list
  → ⚠️ Default permissions NOT auto-seeded — admin must run POST /api/v1/permissions/seed
  → Staff can now login at /${slug}/login after admin creates their accounts
```

### Patient Registration Flow (via Receptionist)

```
Receptionist → /dashboard/patients → "Register Patient"
  → POST /patients { name, phone, email, gender, age, dob, address }
  → Patient gets a unique patientId (e.g. P-001)
  → Patient can login at /patient/login if given email + password
  → ⚠️ Patient password must be set by admin — no self-registration exists
```

---

## API Issues Found

| Issue | Endpoint | Description |
|-------|----------|-------------|
| Missing field | `POST /patients` | `phone` marked required in UI but optional in schema |
| No date param | `POST /appointments` | Always creates for today — no future scheduling |
| No seed trigger | Org creation | Permissions not auto-seeded for new orgs |
| Consultation fee | `GET /appointments` | Returns `consultationFee` but UI shows `$` not `₹` |
