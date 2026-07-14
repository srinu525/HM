import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RECEPTIONIST" | "DOCTOR" | "PHARMACIST";
  phone?: string;
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
  dob: string;
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
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
  register: (data: { name: string; email: string; password: string; role: string; phone?: string }) =>
    api.post<AuthResponse>("/auth/register", data),
  getProfile: () => api.get<User>("/auth/profile"),
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
  updateStock: (id: string, stock: number) =>
    api.put(`/pharmacy/medicines/${id}/stock`, { stock }),
  createSale: (data: SaleData) => api.post("/pharmacy/sales", data),
  getSales: () => api.get("/pharmacy/sales"),
  createPrescription: (data: PrescriptionData) => api.post("/pharmacy/prescriptions", data),
};

export const userApi = {
  getAll: () => api.get("/users"),
  getDoctors: () => api.get("/users/doctors"),
  update: (id: string, data: Partial<User>) => api.put(`/users/${id}`, data),
};

export const notificationApi = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put("/notifications/read-all"),
};

export const statsApi = {
  getBasic: () => api.get("/stats"),
  getAnalytics: () => api.get("/stats/analytics"),
  getAppointmentHistory: (filters?: { doctorId?: string; patientId?: string; startDate?: string; endDate?: string }) =>
    api.get("/stats/appointments/history", { params: filters }),
  getSalesHistory: (filters?: { startDate?: string; endDate?: string }) =>
    api.get("/stats/sales/history", { params: filters }),
};
