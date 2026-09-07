# HM System — Super Admin Role Review

> Reviewed: September 3, 2026  
> Context: Multi-tenant hospital management SaaS platform  
> Purpose: Full audit of Super Admin responsibilities, current features, gaps, and unnecessary items

---

## What Super Admin Manages

The Super Admin is the **platform owner** — not a hospital employee. They manage the SaaS product itself:
all hospitals (organizations), their subscriptions, billing plans, module access, and platform health.
They do NOT do any clinical work.

---

## Current Super Admin Navigation

```
Overview
  ├── Dashboard          (platform KPIs)
  └── Analytics          (platform-wide usage trends)

Management
  ├── Organizations      (list all hospitals, create/toggle active)
  ├── All Users          (cross-org user list, activate/deactivate)
  └── Subscriptions      (plan management + org subscription management)

Finance
  └── Revenue            (pharmacy sales + invoice revenue per org)

Control
  ├── Feature Flags      (enable/disable modules per org)
  ├── Audit Logs         (cross-org activity log)
  └── Platform Settings  (global config: name, email, SMTP, limits, security)
```

---

## Detailed Feature Audit

### Dashboard (`/admin`)
**What it shows:**
- MRR, ARR, today's revenue (sales + invoices)
- Avg revenue per org
- Active subscriptions, new this month, cancelled this month + churn %
- Total orgs, total users, total patients, today's appointments
- Top 5 orgs by revenue (mini bar chart)
- Recently added organizations

**What's missing:**
- No "expiring subscriptions" alert — orgs whose subscription ends in 7 days should be highlighted
- No "inactive orgs" count widget — orgs that have been deactivated (soft-deleted)
- No "orgs with no subscription" count — orgs that never subscribed to any plan
- No "system health" widget — server uptime, DB status, last backup timestamp

---

### Organizations (`/admin/organizations`)
**What it does:**
- List all organizations with user count, patient count, medicine count, plan badge
- Search and filter by active/inactive
- Create new organization (name, slug, email, phone, timezone, currency, address)
- Toggle active/inactive per org
- Link to org detail page

**What's missing:**
- No **export to CSV** — platform owner may need a list of all hospitals for reporting
- No **sort by date, revenue, or patient count** — currently sorted by creation date only
- No **"Created by" field** — who onboarded this hospital? Useful for tracking
- **Create org does not auto-assign a default plan** — new org is created with no subscription, which means staff can't access anything until Super Admin manually assigns a plan. Should offer a plan selection during org creation
- **Create org does not auto-seed permissions** — the `POST /permissions/seed` must be called manually for each new org to work. Should happen automatically on org creation

---

### Organization Detail (`/admin/organizations/[id]`)
**What it does:**
- Edit all org fields (name, email, phone, timezone, currency, GST/VAT, address, license)
- Stats: user count, patient count, medicine count, notification count
- Subscription panel: current plan, start/end date, history, force-assign, force-cancel
- Feature flags: toggle 8 modules per org
- Staff users list with role and active status

**What's missing:**
- **No "Login as org admin" / impersonation** — Super Admin has no way to see what a hospital admin sees without creating a separate account. An "Act as" feature would help support
- **No way to view/reset org admin password** — if the org's admin is locked out, Super Admin has no recovery path
- **Subscription history is limited to 10 rows** — for long-running orgs, older history is invisible
- **Feature flags only show 8 modules** — `consultations`, `scheduling`, `departments`, `settings` are not exposed as feature flags even though they exist as modules
- **No direct link to org's audit log** — you have to go to the audit logs page and then filter. A "View Audit Logs" button on this page would be faster

---

### All Users (`/admin/users`)
**What it does:**
- Cross-org user list with name, email, role, organization, joined date
- Filter by role (pill buttons) and active/inactive status
- Search by name, email, or org name
- Toggle active/inactive per user

**What's missing:**
- **No ability to change a user's role** — only activate/deactivate. A role change from here would help support scenarios
- **No ability to reset a user's password** — common support request. Super Admin should be able to trigger a password reset
- **No "move user to another org"** — edge case but useful when a hospital merges or splits
- **No export** — cross-org user export for compliance/auditing

---

### Subscriptions (`/admin/subscriptions`)
**What it does (Plans tab):**
- Create, edit, activate/deactivate subscription plans
- Plan fields: name, description, monthly price, yearly price, billing cycle, trial days, max users, max doctors, modules, features
- Add-on facilities: create, edit, delete module add-ons

**What it does (Org Subscriptions tab):**
- View all org subscriptions with status, plan, days remaining
- Force-assign a plan to any org (with months + note)
- Force-cancel any org's subscription
- Link to org detail

**What's missing:**
- **No subscription renewal notifications to org admin** — when a subscription is about to expire, the org admin should receive an email/notification. The cron job exists but there's no UI confirmation that it's configured
- **No "extend subscription" shortcut** — force-assign effectively works but it's clunky. A simple "+30 days" button would be cleaner
- **No subscription tier upgrade/downgrade path with proration** — currently assign replaces the plan immediately with no cost calculation
- **No payment proof / invoice generation** — when a hospital pays for a plan, there's no way to generate or upload a payment receipt
- **Trial conversion flow** — when a TRIAL subscription nears its end, there's no automated flow to prompt the org admin to upgrade

---

### Revenue (`/admin/revenue`)
**What it does:**
- 4 KPI cards: total revenue, pharmacy sales, invoice revenue, total patients
- Per-org breakdown sorted by total/sales/invoice with mini bar charts
- Links to org detail from revenue table

**What's missing:**
- **No date filter** — shows all-time revenue. Cannot view revenue for "this month" or "last quarter"
- **No monthly trend chart** — revenue over time per org. Currently only a single cumulative total
- **Subscription revenue vs operational revenue split** — the "invoice revenue" includes consultation fees paid by patients, not subscription payments. Platform subscription revenue (what orgs pay for the SaaS) is nowhere shown
- **No revenue export** — cannot download revenue breakdown as CSV
- **Currency inconsistency** — revenue is shown in ₹ but orgs can be configured with USD, EUR etc. No conversion or currency label per org

---

### Analytics (`/admin/analytics`)
**What it shows:**
- Summary: active orgs, subscribed orgs, total staff users, total patients
- Daily appointments (last 14 days) — bar chart
- Daily new patients (last 14 days) — bar chart
- Top orgs by revenue — bar chart
- Daily revenue trend (last 14 days) — bar chart

**What's missing:**
- **No date range selector** — hardcoded to last 14 days. Should allow 7d / 30d / 90d / custom
- **No org growth chart** — new organizations registered per month
- **No subscription plan distribution** — how many orgs are on Free vs Starter vs Professional vs Enterprise. A pie/donut chart would make this clear
- **No feature flag adoption** — which features are most commonly disabled. Useful for product decisions
- **System analytics data is incomplete** — the `getSystemAnalytics` service only counts pharmacy sales as revenue (not invoice payments), so the revenue trend chart is wrong

---

### Feature Flags (`/admin/feature-flags`)
**What it does:**
- Select an org from a searchable list
- Show 8 module flags (appointments, pharmacy, lab, billing, notifications, audit_logs, file_uploads, reports)
- Toggle per flag, enable all, disable all

**What's missing:**
- **8 flags is incomplete** — `consultations`, `prescriptions`, `queue`, `scheduling`, `departments`, `settings` are real modules but not exposed as flags
- **No global flag template** — "apply these flags to all new orgs by default". Currently every new org starts with all flags enabled
- **No bulk apply to all orgs** — cannot push a flag change to all organizations at once (e.g. rolling out a new feature globally)
- **Flags have no description on creation** — the `name` is just the key string. No human-readable description stored
- **No flag change history** — when was a flag last toggled and by whom? This is a high-impact action with no audit trail in the flag itself (though it may be in general audit logs)

---

### Audit Logs (`/admin/audit-logs`)
**What it does:**
- Cross-org audit log with org, action, entity, entity ID, IP address, timestamp
- Filter by org, entity type, action type
- Quick filter buttons: CREATE, UPDATE, DELETE, LOGIN
- Paginated (50 per page)

**What's missing:**
- **No date range filter** — cannot view "what happened last Tuesday". Date from/to filter is essential
- **No user filter** — cannot filter by which staff member performed an action
- **No export to CSV** — compliance teams need to download audit logs
- **No log retention enforcement** — the `data_retention_days` setting exists in Platform Settings but nothing actually deletes old logs
- **Entity ID is truncated** — shows only first 8 characters of UUID. Should be fully copyable or have a "view record" link
- **LOGIN events not captured** — the audit log middleware only covers CRUD operations. Login/logout events are not recorded

---

### Platform Settings (`/admin/settings`)
**What it does:**
- 4 setting groups: General (platform name, email, URL, phone), Limits (max orgs, users, trial days, retention), Notifications (SMTP config), Security (maintenance mode, JWT expiry, login attempts)
- Each setting is a key-value pair stored in `PlatformSetting` table
- Save all button

**What's missing:**
- **Settings don't actually do anything yet** — the values are stored but the application code doesn't read them at runtime. For example, `maintenance_mode = true` doesn't actually block access, `max_organizations` doesn't prevent org creation, `jwt_expiry_hours` doesn't override the JWT configuration
- **No maintenance mode banner** — when maintenance mode is enabled, there's no user-facing message to hospitals
- **SMTP settings are not used** — the email service reads from environment variables, not from `PlatformSetting`. These settings are essentially decorative
- **No "Test Email" button** — cannot verify SMTP config without sending an actual system email
- **No backup settings** — the cron job does nightly backups but destination path, retention period, and on/off switch are not exposed here

---

## Summary: What to Remove / Simplify

| Feature | Issue | Recommendation |
|---|---|---|
| **All Users → only activate/deactivate** | Too limited for a platform admin | Add role change + password reset |
| **Revenue page has no date filter** | All-time view is not actionable | Add date range filter (this month / last 3 months / custom) |
| **Platform Settings are non-functional** | Settings stored but not read at runtime | Either implement the effects or remove misleading fields |
| **8 feature flags** | Misses half the actual modules | Add consultations, prescriptions, queue, scheduling, departments |
| **Analytics hardcoded to 14 days** | Not useful for business review | Add period selector |
| **Audit logs lack date and user filter** | Critical missing filters | Add date range + user filter |

---

## Summary: What to Add

### High Priority
| Feature | Why |
|---|---|
| **Auto-assign default plan on org creation** | New org currently starts with no subscription — staff can't access any module |
| **Auto-seed permissions on org creation** | New org staff get 0 permissions without a manual seed call |
| **Expiring subscriptions alert on dashboard** | Prevent unintended lapses — show "5 orgs expire in 7 days" |
| **Date filter on Revenue page** | Monthly/quarterly revenue reporting is a basic business requirement |
| **Date filter on Audit Logs page** | Without this, compliance queries are impractical |

### Medium Priority
| Feature | Why |
|---|---|
| **Implement Platform Settings at runtime** | Make maintenance_mode, JWT expiry, and SMTP settings actually work |
| **Password reset for org admin** | Common support request — Super Admin needs this recovery path |
| **Subscription expiry email automation confirmation** | Show Super Admin that reminder cron is active and when it last ran |
| **Revenue export (CSV)** | Needed for accounting and investor reporting |
| **Org creation with plan selection + permission seed** | Complete onboarding in one step instead of three |
| **Audit log export (CSV)** | Required for compliance/HIPAA scenarios |

### Lower Priority
| Feature | Why |
|---|---|
| **Org-level impersonation / Act-as** | Support debugging without needing separate credentials |
| **Platform health widget on dashboard** | Server uptime, DB status, last backup on one screen |
| **Subscription plan distribution chart** | Understand plan adoption (Free vs Paid split) |
| **Feature flag bulk apply to all orgs** | Needed when rolling out new modules globally |
| **Feature flag change history** | Audit trail for high-impact toggle actions |
| **Analytics period selector (7d/30d/90d)** | Business review at different time scales |
| **Org user count trend per org** | Is the hospital growing its team? |

---

## Responsibilities Clarification

The Super Admin should be responsible for exactly these things and nothing else:

| Responsibility | Current Support |
|---|---|
| Onboard new hospitals (create org + assign plan + seed permissions) | ⚠️ Partial — 3 manual steps |
| Manage subscription plans and pricing | ✅ Full |
| Assign / force-cancel subscriptions | ✅ Full |
| Control which modules each hospital can access | ✅ Feature flags (incomplete module list) |
| Monitor platform revenue and growth | ⚠️ Partial — no date filter, no subscription revenue |
| Investigate cross-org issues via audit logs | ⚠️ Partial — no date/user filter |
| Configure global platform behaviour | ⚠️ Settings stored but not enforced |
| Deactivate or remove a hospital | ✅ Soft delete with active-subscription guard |
| View all staff users across all hospitals | ✅ With activate/deactivate only |

**Super Admin should NOT:**
- Do clinical work (no patient/appointment/prescription access)
- Manage individual hospital's internal settings (that's the ADMIN role)
- Handle individual patient complaints (no patient portal access)


---

## Unnecessary Options in Super Admin UI

> This section documents specific UI elements that should be removed or replaced because they are redundant, misleading, or outside the Super Admin's actual responsibilities.

---

### 1. All Users — Standalone Sidebar Page

**Location:** `/admin/users` · Sidebar: Management → All Users

**Why it's unnecessary:**
The page lists every staff member across all organizations with only one action: activate/deactivate.
- The Organization Detail page (`/admin/organizations/[id]`) already shows the staff users for each hospital with the same activate/deactivate toggle
- Managing individual staff accounts is the Hospital Admin's responsibility, not the platform owner's
- A flat cross-org list of users adds no platform-level insight — the Super Admin cares about hospitals, not individual staff

**Action:** Remove "All Users" from the sidebar. Staff management stays within the Org Detail page.

---

### 2. "Total Patients" KPI on Revenue Page

**Location:** `/admin/revenue` · 4th KPI card

**Why it's unnecessary:**
The Revenue page exists to analyze financial performance. Patient count is not a revenue metric. It belongs on the Dashboard or Analytics page. Placing it on the Revenue page implies a relationship between patient count and financial data that is never shown.

**Action:** Remove the "Total Patients" KPI card from the Revenue page.

---

### 3. "Total Staff Users" and "Total Patients" Pills on Analytics Page

**Location:** `/admin/analytics` · Summary pills row (3rd and 4th items)

**Why they're unnecessary:**
The Analytics page opens with 4 summary pills: Active Orgs, Subscribed Orgs, Total Staff Users, Total Patients. The last two are static counts that are already shown as KPI cards on the Dashboard. Analytics should show trends, not repeat static numbers from another page.

**Action:** Remove the "Total Staff Users" and "Total Patients" summary pills from the Analytics page. Keep "Active Orgs" and "Subscribed Orgs" as they provide useful subscription context for the charts below.

---

### 4. "Today's Appointments" KPI on Dashboard

**Location:** `/admin/page.tsx` · Activity section

**Why it's unnecessary:**
Today's appointment count across all hospitals is hospital-operational data. A platform owner (Super Admin) has no business reason to monitor appointment volume — that's the Hospital Admin's concern. This metric is already tracked in the Analytics daily chart for those who need it.

**Action:** Remove "Today's Appointments" from the Super Admin dashboard KPI section.

---

### 5. "Active Medicines" KPI on Dashboard

**Location:** ~~`/admin/page.tsx` · Activity section~~ *(already removed in dashboard refactor)*

**Status:** ✅ **Already resolved.** The "Active Medicines" card no longer exists on the Super Admin dashboard. The `totalMedicines` field is still fetched by the stats endpoint (`stats/service.ts:48`) and declared in the page's `PlatformStats` interface (`admin/page.tsx:17`), but it is **never rendered**. This item is stale in this document.

**Remaining cleanup (optional):** Remove the unused `totalMedicines` field from the `PlatformStats` interface and the corresponding `prisma.medicine.count` from the backend stats query, since the value is no longer displayed anywhere. This is low priority (dead field, no user impact).

---

### 6. "Feature Flags" Quick Action on Dashboard

**Location:** `/admin/page.tsx` · Quick Actions row

**Why it's misplaced:**
The 4 quick actions are: New Organization, Assign Plan, Feature Flags, Audit Logs.  
Feature flags are a one-time setup task done when onboarding a new org — not a frequent daily action. Treating it as a top-level quick action overstates its importance and occupies space better used for high-frequency tasks.

**Action:** Replace the "Feature Flags" quick action with **"Expiring Subscriptions"** — a link that shows orgs whose subscriptions end within 7 days. This is something a platform owner needs to act on regularly.

---

### 7. Non-Functional Platform Settings Fields

**Location:** `/admin/settings` · All 4 groups (General, Limits, Notifications, Security)

**Why they're unnecessary / misleading:**
Every single setting on this page is stored in the database but **never read at runtime**. The application uses environment variables instead. This means:

| Setting | Expected Behavior | Actual Behavior |
|---|---|---|
| `maintenance_mode = true` | Block all access, show maintenance page | Nothing happens |
| `jwt_expiry_hours = 2` | Shorten token lifetime | Token still uses `.env` value |
| `smtp_host / smtp_port / smtp_from` | Override email sender | Email still uses `.env` SMTP config |
| `max_organizations` | Prevent creating more than N orgs | No limit is enforced anywhere |
| `max_users_per_org` | Limit users per hospital | No limit check exists |
| `data_retention_days` | Delete old audit logs | No deletion job exists |

Showing these as configurable settings **misleads the Super Admin** into thinking they've changed system behavior when they haven't. This is worse than having no settings page.

**Action:** Either:
- **Preferred:** Wire up each setting to actually affect runtime behavior before showing it in the UI, OR
- **Interim:** Add a visible warning banner on the page: *"These settings are saved but not yet enforced at runtime. Configuration changes have no effect until implemented."* and mark each group with a `⚠️ Not enforced` label

---

### 8. Add-on Facilities Section in Subscriptions

**Location:** `/admin/subscriptions` · Plans & Add-ons tab → "Add-on Facilities" section

**Why it's unnecessary:**
The Add-ons system (PlanAddon + OrgAddon models) exists in the database and UI but is not enforced anywhere:
- Purchasing an add-on does **not** automatically enable the corresponding feature flag
- No org has ever purchased an add-on in practice
- Add-on pricing has no relationship to actual module access
- The billing page for org admins shows add-ons but adding one does nothing functional

The feature is half-built. Showing it in the Super Admin UI gives the false impression that module access can be sold per-add-on when it cannot.

**Action:** Hide the Add-on Facilities section from the Subscriptions page until the system enforces module access based on purchased add-ons (i.e. buying an add-on automatically enables the corresponding feature flag for that org). Until then it is UI clutter that creates false expectations.

---

## Quick Reference: What to Remove

| # | Item | Location | Action |
|---|---|---|---|
| 1 | All Users standalone page | Sidebar → Management | **Remove** from sidebar |
| 2 | "Total Patients" card | `/admin/revenue` | **Remove** card |
| 3 | "Total Staff Users" + "Total Patients" pills | `/admin/analytics` | **Remove** both pills |
| 4 | "Today's Appointments" KPI | `/admin` Dashboard | **Remove** card |
| 5 | "Active Medicines" KPI | `/admin` Dashboard | ~~Remove card~~ **Already removed** — only cleanup left is the unused `totalMedicines` field |
| 6 | "Feature Flags" quick action | `/admin` Dashboard | **Replace** with "Expiring Subscriptions" |
| 7 | Non-functional Platform Settings | `/admin/settings` | **Add warning labels** or remove until enforced |
| 8 | Add-on Facilities section | `/admin/subscriptions` | **Hide** until add-on enforcement is built |
