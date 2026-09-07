# HM System — Role Feature Review

> Reviewed: September 3, 2026  
> Context: Simple hospital management system  
> Purpose: Identify unnecessary features per role and missing features to add

---

## Table of Contents

1. [Receptionist](#1-receptionist)
2. [Doctor](#2-doctor)
3. [Pharmacist](#3-pharmacist)
4. [Admin (Hospital Administrator)](#4-admin-hospital-administrator)
5. [Patient Portal](#5-patient-portal)
6. [Quick Summary Table](#6-quick-summary-table)

---

## 1. RECEPTIONIST

### Current Features
- Register & edit patients
- Book appointments (doctor, fee, notes)
- View today's appointments list
- Queue view (separate page)
- Create & view invoices
- Record payments
- Appointment history reports
- Notifications

### ❌ Unnecessary / Redundant
| Feature | Reason |
|---|---|
| **Queue page** (separate sidebar item) | Duplicate of the Appointments page filtered to active status. Having both "Appointments" and "Queue" creates confusion. Merge into one page with a tab or filter |
| **Reports → Appointment History** | Shows the same data as the Appointments list filtered by date/doctor. For a receptionist this is redundant — they already see today's appointments. Remove or merge |

### ✅ Missing Features to Add
| Feature | Why It's Needed |
|---|---|
| **Appointment date picker** | Appointments always book for today. Receptionist needs to schedule future appointments (follow-ups, planned visits). This is a critical gap |
| **Patient find-or-create flow** | When a walk-in arrives, receptionist has to go to Patients page to register, then come back to Appointments to book. A single "Search → if not found → quick register → book" flow is needed |
| **Invoice linked to appointment** | When an appointment completes, a prompt to generate an invoice for the consultation fee directly from the appointment view would save steps |
| **Token / appointment slip print** | After booking, a print-friendly slip with: patient name, token number, doctor name, date and time. Standard in any front desk setup |
| **Patient visit count badge** | On the patient list, show how many previous visits a patient has had — quick visual for returning vs new patients |

---

## 2. DOCTOR

### Current Features
- View own queue (dashboard widget)
- Create consultations (diagnosis, notes)
- Create prescriptions (medicines, dosage, duration, instructions)
- View patient records
- Order lab tests & record lab results
- View pharmacy medicines (read-only)
- Notifications

### ❌ Unnecessary / Redundant
| Feature | Reason |
|---|---|
| **Prescriptions** as standalone sidebar page | Prescriptions are created inside the Consultation flow. A separate "go write a prescription" page is confusing — doctors don't walk up and write prescriptions in isolation. Should only exist embedded within a consultation |
| **Lab result recording** | In a simple hospital, recording lab results is a lab technician's job. Doctors should only **order** tests, not enter the actual result values. Mixing both creates role confusion |
| **Pharmacy medicines browse** | Doctors don't need to browse inventory. They pick medicines when writing prescriptions — the prescription form's medicine selector already covers this use case |

### ✅ Missing Features to Add
| Feature | Why It's Needed |
|---|---|
| **"Start Consultation" button on queue** | Currently status update and consultation creation are two separate actions. One "Start Consultation" button should: set appointment to IN_PROGRESS, open the consultation form for that patient — one click instead of two pages |
| **Patient history panel in consultation** | When doctor opens a consultation, show the last 2–3 visits inline: diagnosis, medicines prescribed, lab results. Doctors need this context to treat effectively |
| **Vital signs capture** | Blood pressure, temperature, weight, pulse before/during consultation. Simple fields but essential clinical data. Currently no place to record this |
| **Previous visits summary on queue item** | When a patient appears in queue, clicking their name should show a brief history popup — last visit date, diagnosis, ongoing medications |
| **Sick / fitness certificate generation** | One of the most common doctor tasks in a simple hospital. A simple templated PDF: patient name, date, diagnosis, rest advised. No equivalent exists currently |
| **Follow-up date field on consultation** | After consultation, doctor should be able to set "come back in X days" which creates an alert or a pre-booked appointment |

---

## 3. PHARMACIST

### Current Features
- Add / edit medicines (name, price, stock, expiry, batch number)
- Inventory alerts (low stock, expiring, expired)
- Process sales (create sale for a patient)
- View prescriptions
- View lab results
- Notifications

### ❌ Unnecessary / Redundant
| Feature | Reason |
|---|---|
| **Lab results access** | Pharmacists have no clinical reason to see lab results in a simple hospital. Lab results are between doctor and patient. Remove this permission |
| **Prescriptions as separate sidebar page** | Pharmacists view prescriptions only in the context of dispensing. The prescription list should appear inside the Sales flow ("fulfill a prescription"), not as a standalone navigation item |
| **Pharmacy Overview page** | This page is a near-duplicate of the Inventory page. One clean inventory page with summary stats at the top is sufficient. Remove the separate Overview |

### ✅ Missing Features to Add
| Feature | Why It's Needed |
|---|---|
| **Prescription-linked dispensing** | When creating a sale, pharmacist should be able to select an open (unfulfilled) prescription — the medicines, quantities automatically fill in. Currently sales and prescriptions are completely disconnected |
| **Mark prescription as dispensed** | After sale is created from a prescription, it should be marked "DISPENSED" so the doctor and patient know it was fulfilled. No such status exists |
| **Medicine autocomplete / search in sales** | Currently adding a sale requires knowing the medicineId. A proper search-as-you-type medicine selector with name, stock, and price shown is essential |
| **Expiry warning on dispensing** | If a medicine being sold expires within 30 days, warn the pharmacist before confirming the sale |
| **Daily / shift summary** | End-of-shift view: total transactions, total revenue, top 5 medicines sold. Pharmacists need this to reconcile cash |
| **Return / refund recording** | If a patient returns a medicine, there's no way to record it or add stock back. Needed for accurate inventory |

---

## 4. ADMIN (Hospital Administrator)

### Current Features
- User management (create, activate/deactivate staff, assign roles)
- Department management (CRUD with consultation fees)
- Roles & Permissions editor (checkbox-based per role)
- Doctor schedule management + leave approval
- Organization settings (General, Appointment, Pharmacy, Billing tabs)
- Invoice oversight (view, status update, delete)
- Audit logs (read-only)
- Appointment history reports
- Subscription / billing management
- Notifications

### ❌ Unnecessary / Redundant
| Feature | Reason |
|---|---|
| **Organizations sidebar link** | Links to a page that duplicates what's already in Settings. "Organizations" is a Super Admin / multi-tenant concept. For an Admin who manages one hospital, this is confusing and redundant |
| **Subscription management** | In a simple hospital the administrator doesn't manage SaaS billing — the owner or IT does. If kept, it should be hidden behind a feature flag or restricted to a "Billing" section visible only to the account owner |
| **Reports → Appointment History** | Admin gets the same raw list a Receptionist sees. An Admin needs summary-level reports (revenue this month, top doctors by patient count), not individual appointment rows |
| **Queue / Clinical sidebar items** | Admin has read-only patients.read and appointments.read — they see the Clinical sidebar but shouldn't be navigating clinical workflows. Clinical items should be hidden from Admin |

### ✅ Missing Features to Add
| Feature | Why It's Needed |
|---|---|
| **Admin dashboard with real widgets** | Currently Admin renders the same dashboard analytics as Receptionist. Admin needs their own KPIs: total staff active today, pending leave requests, this month's revenue, new patient registrations this month |
| **Staff on-leave today** | Admin needs a quick view: who is on approved leave today, who called in sick. Currently leave is approved but there's no "staffing dashboard" |
| **Revenue by doctor report** | Which doctor generated how much consultation fee this month/quarter. Essential for a hospital administrator managing doctor performance and payroll |
| **Patient trend chart** | New patient registrations per week/month. Helps admin understand growth and capacity planning |
| **Department-wise appointment counts** | How many appointments went to each department this week. Helps admin understand load distribution |
| **Pending approvals badge** | A sidebar badge showing count of pending leave requests that need approval. Admins miss these without a visual indicator |

---

## 5. PATIENT PORTAL

### Current Features
- Dashboard (upcoming appointments, completed visit count)
- Book appointment (pick any doctor)
- View all appointments with status
- View prescriptions (medicines, dosage, duration)
- View lab results
- View invoices
- Pay invoices (marks as paid — no actual payment gateway)
- Edit profile (name, phone, address, change password)

### ❌ Unnecessary / Misleading
| Feature | Reason |
|---|---|
| **"Pay Bills" button** | Marks invoice as paid without any actual payment processing. This is misleading to patients — they click "Pay" thinking they've paid digitally, but no money moves. Should be renamed "View Bills" and the Pay button hidden until a real payment gateway is integrated |
| **Lab Results page (always visible)** | Most simple hospitals don't upload digital lab results. The page should only show when the lab module is active (feature-flagged) and the doctor has recorded results for the patient. Currently it shows an empty state confusingly |

### ✅ Missing Features to Add
| Feature | Why It's Needed |
|---|---|
| **Appointment cancellation** | Patients can book but cannot cancel. They need a "Cancel" button on upcoming/scheduled appointments — basic self-service feature |
| **Doctor schedule / availability before booking** | When booking, patient can only pick a doctor by name but can't see if they're working today or what their hours are. Show doctor's working days and hours before booking |
| **Prescription PDF download** | The PDF generation endpoint exists on the server. Patients should be able to download their prescription as a PDF directly from the portal. This is a top patient request in any hospital |
| **Visit summary after consultation** | After an appointment is marked COMPLETED, show the patient: diagnosis, medicines prescribed, any follow-up instructions. Currently patients only see "COMPLETED" with no details |
| **Appointment confirmation notification** | When a receptionist books an appointment for a patient, the patient gets no notification. A push notification (and ideally email/SMS) confirming the booking is standard |
| **Upcoming appointment reminder** | The cron job sends appointment reminders but the patient portal doesn't show them. Add a "Tomorrow's Appointment" banner on the patient dashboard |

---

## 6. Quick Summary Table

| Role | Remove / Simplify | Add |
|---|---|---|
| **RECEPTIONIST** | Queue page (merge with Appointments) · Duplicate Reports page | Appointment date picker · Find-or-create patient flow · Invoice on appointment close · Token slip print |
| **DOCTOR** | Standalone Prescriptions page · Lab result recording · Pharmacy browse | Start-consultation-from-queue button · Patient history in consultation · Vital signs · Sick certificate PDF · Follow-up date |
| **PHARMACIST** | Lab results access · Separate Prescriptions page · Pharmacy Overview page | Prescription-linked dispensing · Mark prescription dispensed · Medicine autocomplete · Expiry warning on sale · Daily shift summary · Refund/return recording |
| **ADMIN** | Organizations link (duplicate) · Subscription page · Raw appointment reports · Clinical sidebar items | Admin KPI dashboard · Staff on-leave today · Revenue by doctor report · Patient trend chart · Department load report · Pending approvals badge |
| **PATIENT** | "Pay" button (misleading) · Lab results page when lab disabled | Appointment cancellation · Doctor availability before booking · Prescription PDF download · Visit summary after consultation · Booking confirmation notification |

---

## Implementation Priority

### High Priority (affects daily operations)
1. Appointment date picker (Receptionist)
2. Start-consultation-from-queue (Doctor)
3. Prescription-linked dispensing (Pharmacist)
4. Appointment cancellation (Patient)
5. Admin KPI dashboard widgets

### Medium Priority (improves efficiency)
6. Patient find-or-create flow (Receptionist)
7. Patient history panel in consultation (Doctor)
8. Medicine autocomplete in sales (Pharmacist)
9. Revenue by doctor report (Admin)
10. Prescription PDF download (Patient)

### Lower Priority (polish and completeness)
11. Token slip print (Receptionist)
12. Vital signs capture (Doctor)
13. Daily shift summary (Pharmacist)
14. Staff on-leave dashboard (Admin)
15. Visit summary after consultation (Patient)
16. Sick/fitness certificate (Doctor)
17. Refund recording (Pharmacist)
18. Doctor availability view (Patient)
