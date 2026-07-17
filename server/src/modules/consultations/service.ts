import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class ConsultationService {
  async create(data: { appointmentId: string; doctorId: string; diagnosis?: string; notes?: string }) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
    });

    if (!appointment) {
      throw AppError.notFound("Appointment not found");
    }

    await prisma.appointment.update({
      where: { id: data.appointmentId },
      data: { status: "COMPLETED" },
    });

    return prisma.consultation.create({
      data: {
        appointmentId: data.appointmentId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis,
        notes: data.notes,
      },
      include: {
        appointment: {
          include: { patient: true },
        },
      },
    });
  }

  async getByDoctor(doctorId: string) {
    return prisma.consultation.findMany({
      where: { doctorId },
      include: {
        appointment: {
          include: { patient: { select: { id: true, patientId: true, name: true, phone: true } } },
        },
        prescriptions: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async getTodayCompletedByDoctor(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.consultation.findMany({
      where: {
        doctorId,
        createdAt: { gte: today, lt: tomorrow },
      },
      include: {
        appointment: {
          include: { patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, dob: true } } },
        },
        prescriptions: {
          include: {
            items: {
              include: { medicine: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getByPatient(patientId: string) {
    return prisma.consultation.findMany({
      where: {
        appointment: { patientId },
      },
      include: {
        appointment: { select: { date: true, token: true } },
        doctor: { select: { name: true } },
        prescriptions: {
          include: {
            items: {
              include: { medicine: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
}

export const consultationService = new ConsultationService();
