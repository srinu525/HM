import { prisma } from "../../utils/prisma";

export class AppointmentService {
  async create(data: { patientId: string; doctorId: string; notes?: string; consultationFee?: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastToken = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
      },
      orderBy: { token: "desc" },
    });

    const token = (lastToken?.token || 0) + 1;

    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        notes: data.notes,
        consultationFee: data.consultationFee || 0,
        token,
      },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true } },
      },
    });
  }

  async getByDoctor(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
      },
      include: {
        patient: { select: { id: true, name: true, phone: true, gender: true } },
      },
      orderBy: { token: "asc" },
    });
  }

  async updateStatus(id: string, status: string) {
    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) {
      throw { statusCode: 404, message: "Appointment not found" };
    }

    return prisma.appointment.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getQueue(doctorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      },
      include: {
        patient: { select: { id: true, name: true, phone: true, gender: true, dob: true } },
      },
      orderBy: { token: "asc" },
    });
  }

  async getTodayAll() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return prisma.appointment.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 86400000),
        },
      },
      include: {
        patient: { select: { id: true, name: true, phone: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { token: "asc" },
    });
  }
}

export const appointmentService = new AppointmentService();
