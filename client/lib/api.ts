import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRedirecting = false;

function redirectToLogin() {
  if (isRedirecting) return;
  isRedirecting = true;
  if (typeof window !== "undefined") {
    const savedSlug = localStorage.getItem("orgSlug") || "default-hospital";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = `/${savedSlug}/login`;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    } else if (error.response?.status === 403) {
      const msg = error.response?.data?.message || "";
      if (msg.includes("organization") || msg.includes("Not authenticated") || msg.includes("No token")) {
        redirectToLogin();
      }
    }
    return Promise.reject(error);
  }
);

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST" | "PATIENT";
  phone?: string;
  organizationId: string;
  organization?: Organization;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PatientData {
  name: string;
  phone?: string;
  email?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  age: number;
  dob?: string;
  address?: string;
}

export interface AppointmentData {
  patientId: string;
  doctorId: string;
  notes?: string;
  consultationFee?: number;
}

export interface ConsultationData {
  appointmentId: string;
  diagnosis?: string;
  notes?: string;
}

export interface MedicineData {
  name: string;
  description?: string;
  price: number;
  stock: number;
  expiryDate?: string;
  batchNumber?: string;
  reorderLevel?: number;
}

export interface SaleItemData {
  medicineId: string;
  quantity: number;
}

export interface SaleData {
  patientId: string;
  items: SaleItemData[];
}

export interface PrescriptionItemData {
  medicineId: string;
  dosage: string;
  duration: string;
  instructions?: string;
  quantity?: number;
}

export interface PrescriptionData {
  patientId: string;
  consultationId: string;
  notes?: string;
  items: PrescriptionItemData[];
}

export const authApi = {
  login: (email: string, password: string, organizationSlug: string) =>
    api.post<{ success: boolean; data: AuthResponse }>("/auth/login", { email, password, organizationSlug }),
  register: (data: { name: string; email: string; password: string; role: string; organizationId: string; phone?: string }) =>
    api.post<{ success: boolean; data: AuthResponse }>("/auth/register", data),
  getProfile: () => api.get<{ success: boolean; data: User }>("/auth/profile"),
};

export const patientApi = {
  getAll: (search?: string) =>
    api.get("/patients", { params: { search } }),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: PatientData) => api.post("/patients", data),
  update: (id: string, data: Partial<PatientData>) => api.put(`/patients/${id}`, data),
};

export const appointmentApi = {
  create: (data: AppointmentData) => api.post("/appointments", data),
  getByDoctor: (doctorId: string) => api.get(`/appointments/doctor/${doctorId}`),
  getQueue: (doctorId: string) => api.get(`/appointments/queue/${doctorId}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/appointments/${id}/status`, { status }),
};

export const consultationApi = {
  create: (data: ConsultationData) => api.post("/consultations", data),
  getByDoctor: () => api.get("/consultations"),
  getByPatient: (patientId: string) => api.get(`/consultations/patient/${patientId}`),
  getTodayCompleted: () => api.get("/consultations/completed-today"),
};

export const pharmacyApi = {
  getMedicines: (search?: string) =>
    api.get("/pharmacy/medicines", { params: { search } }),
  createMedicine: (data: MedicineData) => api.post("/pharmacy/medicines", data),
  updateMedicine: (id: string, data: Record<string, unknown>) =>
    api.put(`/pharmacy/medicines/${id}`, data),
  updateStock: (id: string, stock: number) =>
    api.put(`/pharmacy/medicines/${id}/stock`, { stock }),
  getInventoryAlerts: () => api.get("/pharmacy/inventory/alerts"),
  createSale: (data: SaleData) => api.post("/pharmacy/sales", data),
  getSales: () => api.get("/pharmacy/sales"),
  getPrescriptions: (filters?: { patientId?: string; doctorId?: string; startDate?: string; endDate?: string }) =>
    api.get("/pharmacy/prescriptions", { params: filters }),
  downloadPrescriptionPdf: (id: string) =>
    api.get(`/pharmacy/prescriptions/${id}/pdf`, { responseType: "blob" }),
  createPrescription: (data: PrescriptionData) => api.post("/pharmacy/prescriptions", data),
};

export const userApi = {
  getAll: () => api.get("/users"),
  getDoctors: () => api.get("/users/doctors"),
  update: (id: string, data: Partial<User>) => api.put(`/users/${id}`, data),
};

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
};

export const organizationApi = {
  getAll: () => api.get("/organizations"),
  getById: (id: string) => api.get(`/organizations/${id}`),
  create: (data: { name: string; slug: string; email?: string; phone?: string; address?: string }) =>
    api.post("/organizations", data),
  update: (id: string, data: { name?: string; email?: string; phone?: string; address?: string; isActive?: boolean }) =>
    api.put(`/organizations/${id}`, data),
  getStats: (id: string) => api.get(`/organizations/${id}/stats`),
};

export const statsApi = {
  getBasic: () => api.get("/stats"),
  getAnalytics: () => api.get("/stats/analytics"),
  getAppointmentHistory: (filters?: { doctorId?: string; patientId?: string; startDate?: string; endDate?: string }) =>
    api.get("/stats/appointments/history", { params: filters }),
  getSalesHistory: (filters?: { startDate?: string; endDate?: string }) =>
    api.get("/stats/sales/history", { params: filters }),
  getSystemStats: () => api.get("/stats/system"),
  getSystemAnalytics: () => api.get("/stats/system/analytics"),
};

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  maxUsers: number;
  maxPatients: number;
  features: string[];
  isActive: boolean;
  _count?: { subscriptions: number };
}

export interface Subscription {
  id: string;
  startDate: string;
  endDate: string | null;
  status: string;
  plan: Plan;
}

export const billingApi = {
  getPlans: () => api.get("/billing/plans"),
  getPlan: (id: string) => api.get(`/billing/plans/${id}`),
  createPlan: (data: Omit<Plan, "id" | "isActive" | "_count">) => api.post("/billing/plans", data),
  updatePlan: (id: string, data: Partial<Plan>) => api.put(`/billing/plans/${id}`, data),
  getSubscription: () => api.get("/billing/subscription"),
  subscribe: (planId: string, months?: number) => api.post("/billing/subscription", { planId, months }),
  cancelSubscription: (id: string) => api.put(`/billing/subscription/${id}/cancel`),
};

export const auditLogApi = {
  getAll: (filters?: { entity?: string; action?: string; userId?: string; page?: number; limit?: number }) =>
    api.get("/audit-logs", { params: filters }),
};

export const labApi = {
  getTests: () => api.get("/lab/tests"),
  createTest: (data: { name: string; description?: string; price?: number }) => api.post("/lab/tests", data),
  updateTest: (id: string, data: { name?: string; description?: string; price?: number; isActive?: boolean }) => api.put(`/lab/tests/${id}`, data),
  getResults: (filters?: { patientId?: string; doctorId?: string; labTestId?: string; status?: string }) =>
    api.get("/lab/results", { params: filters }),
  createResult: (data: { labTestId: string; patientId: string; result: Record<string, unknown>; notes?: string; status?: string }) =>
    api.post("/lab/results", data),
  updateResult: (id: string, data: { result?: Record<string, unknown>; notes?: string; status?: string }) =>
    api.put(`/lab/results/${id}`, data),
};

export const invoiceApi = {
  getAll: (filters?: { status?: string; patientId?: string }) => api.get("/invoices", { params: filters }),
  getById: (id: string) => api.get(`/invoices/${id}`),
  create: (data: { description?: string; patientId?: string; subscriptionId?: string; tax?: number; dueDate?: string; items: { description: string; quantity: number; unitPrice: number }[] }) =>
    api.post("/invoices", data),
  updateStatus: (id: string, status: string) => api.put(`/invoices/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/invoices/${id}`),
  downloadPdf: (id: string) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),
  getStats: () => api.get("/invoices/stats"),
  recordPayment: (data: { invoiceId?: string; patientId?: string; amount: number; method?: string; reference?: string; notes?: string }) =>
    api.post("/invoices/payments", data),
  getPayments: (filters?: { patientId?: string; method?: string }) =>
    api.get("/invoices/payments/list", { params: filters }),
};

export const fileApi = {
  getByEntity: (entity: string, entityId: string) =>
    api.get("/files", { params: { entity, entityId } }),
  upload: (formData: FormData) =>
    api.post("/files/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id: string) => api.delete(`/files/${id}`),
};

export interface PatientPortalAuthResponse {
  patient: {
    id: string;
    patientId: string;
    name: string;
    email: string;
    phone: string | null;
    gender: string;
    age: number;
    organizationId: string;
    organization: { id: string; name: string; slug: string };
  };
  token: string;
}

export const patientPortalApi = {
  login: (email: string, password: string, organizationSlug: string) =>
    api.post<{ success: boolean; data: PatientPortalAuthResponse }>("/patient/auth/login", { email, password, organizationSlug }),
  getProfile: () => api.get<{ success: boolean; data: any }>("/patient/profile"),
  updateProfile: (data: { name?: string; phone?: string; address?: string; password?: string }) =>
    api.put("/patient/profile", data),
  getAppointments: () => api.get("/patient/appointments"),
  bookAppointment: (data: { doctorId: string; notes?: string }) =>
    api.post("/patient/appointments", data),
  getDoctors: () => api.get("/patient/doctors"),
  getPrescriptions: () => api.get("/patient/prescriptions"),
  getLabResults: () => api.get("/patient/lab-results"),
  getInvoices: () => api.get("/patient/invoices"),
  payInvoice: (id: string) => api.post(`/patient/invoices/${id}/pay`),
  downloadInvoicePdf: (id: string) => api.get(`/patient/invoices/${id}/pdf`, { responseType: "blob" }),
};

export const departmentApi = {
  getAll: () => api.get("/departments"),
  getById: (id: string) => api.get(`/departments/${id}`),
  create: (data: { name: string; description?: string; consultationFee?: number; workingHours?: string }) =>
    api.post("/departments", data),
  update: (id: string, data: { name?: string; description?: string; consultationFee?: number; workingHours?: string }) =>
    api.put(`/departments/${id}`, data),
  toggleActive: (id: string) => api.put(`/departments/${id}/toggle-active`),
};

export const settingsApi = {
  getAll: (category?: string) => api.get("/settings", { params: category ? { category } : undefined }),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  upsert: (key: string, value: string, category?: string) => api.put("/settings", { key, value, category }),
  bulkUpsert: (settings: { key: string; value: string; category?: string }[]) =>
    api.put("/settings/bulk", { settings }),
};

export const permissionApi = {
  getAll: () => api.get("/permissions"),
  getRolePermissions: (role: string) => api.get(`/permissions/roles/${role}`),
  setRolePermissions: (role: string, permissionIds: string[]) =>
    api.put(`/permissions/roles/${role}`, { permissionIds }),
  getUserPermissions: (userId: string) => api.get(`/permissions/users/${userId}`),
  setUserPermissions: (userId: string, permissions: { permissionId: string; granted: boolean }[]) =>
    api.put(`/permissions/users/${userId}`, { permissions }),
  seed: () => api.post("/permissions/seed"),
};

export const schedulingApi = {
  getDoctorSchedules: () => api.get("/scheduling/doctors"),
  getSchedule: (userId: string) => api.get(`/scheduling/schedule/${userId}`),
  upsertSchedule: (userId: string, schedules: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]) =>
    api.put(`/scheduling/schedule/${userId}`, { schedules }),
  getLeaveRequests: (status?: string) => api.get("/scheduling/leaves", { params: status ? { status } : undefined }),
  createLeaveRequest: (data: { userId: string; startDate: string; endDate: string; reason?: string }) =>
    api.post("/scheduling/leaves", data),
  updateLeaveStatus: (id: string, status: string) => api.put(`/scheduling/leaves/${id}`, { status }),
};

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getRevenue: () => api.get("/admin/revenue"),
  getOrganizations: () => api.get("/admin/organizations"),
  getOrganization: (id: string) => api.get(`/admin/organizations/${id}`),
  createOrganization: (data: { name: string; slug: string; email?: string; phone?: string; address?: string }) =>
    api.post("/admin/organizations", data),
  updateOrganization: (id: string, data: { name?: string; email?: string; phone?: string; address?: string; isActive?: boolean }) =>
    api.put(`/admin/organizations/${id}`, data),
  getUsers: () => api.get("/admin/users"),
  updateUser: (id: string, data: { isActive?: boolean; role?: string }) =>
    api.put(`/admin/users/${id}`, data),
  getFeatureFlags: (orgId: string) => api.get(`/admin/organizations/${orgId}/feature-flags`),
  setFeatureFlag: (orgId: string, key: string, isEnabled: boolean) =>
    api.put(`/admin/organizations/${orgId}/feature-flags`, { key, isEnabled }),
  getSettings: () => api.get("/admin/settings"),
  setSetting: (key: string, value: string, category?: string) =>
    api.put("/admin/settings", { key, value, category }),
};

export const publicOrgApi = {
  getBySlug: (slug: string) => api.get(`/public/org/${slug}`),
};
