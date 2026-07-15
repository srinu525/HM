import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  age: z.number().min(0, "Age is required"),
  dob: z.string().optional(),
  address: z.string().min(1, "Address is required"),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  notes: z.string().optional(),
  consultationFee: z.number().min(0).optional(),
});

export const medicineSchema = z.object({
  name: z.string().min(2, "Medicine name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().nonnegative("Stock must be 0 or more"),
});

export const consultationSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type MedicineFormData = z.infer<typeof medicineSchema>;
export type ConsultationFormData = z.infer<typeof consultationSchema>;