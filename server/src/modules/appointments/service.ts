import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class AppointmentService {
  async create(data: { patientId: string; doctorId: string; notes?: string; consultationFee?: number; validUntil?: string; date?: string; vitals?: Record<string, string | number | boolean | null> }, organizationId: string) {
    const vitals = (data.vitals && Object.keys(data.vitals).length > 0) ? data.vitals : undefined;
    const appointmentDate = data.date ? new Date(data.date) : new Date();
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    const existing = await prisma.appointment.findFirst({
      where: {
        patientId: data.patientId,
        date: { gte: dayStart, lt: dayEnd },
        status: { not: "CANCELLED" },
      },
    });
    if (existing) {
      throw AppError.badRequest("This patient already has an appointment for this day");
    }
    const lastToken = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: { gte: dayStart, lt: dayEnd },
      },
      orderBy: { token: "desc" },
    });
    const token = (lastToken?.token || 0) + 1;
    const fee = data.consultationFee || 0;

    const appointment = await prisma.$transaction(async (tx) => {
      const appt = await tx.appointment.create({
        data: {
          patientId: data.patientId, doctorId: data.doctorId, notes: data.notes,
          consultationFee: fee,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          date: appointmentDate, token,
          vitals,
        },
        include: {
          patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, dob: true, age: true, address: true } },
          doctor: { select: { id: true, name: true } },
        },
      });

      if (fee > 0 && data.patientId) {
        const invoiceCount = await tx.invoice.count({ where: { organizationId } });
        const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, "0")}`;
        await tx.invoice.create({
          data: {
            invoiceNumber,
            amount: fee,
            tax: 0,
            total: fee,
            status: "SENT",
            description: `Consultation fee for appointment token #${token}`,
            patientId: data.patientId,
            organizationId,
            items: {
              create: {
                description: "Consultation Fee",
                quantity: 1,
                unitPrice: fee,
                total: fee,
              },
            },
          },
        });
      }

      return appt;
    });

    return appointment;
  }

  async getByDoctor(doctorId: string, organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: today, lt: new Date(today.getTime() + 86400000) },
        doctor: { organizationId },
      },
      include: { patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true } } },
      orderBy: { token: "asc" },
    });
  }

  async updateStatus(id: string, status: string, organizationId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { doctor: { select: { organizationId: true } } },
    });
    if (!appointment) { throw AppError.notFound("Appointment not found"); }
    if (appointment.doctor.organizationId !== organizationId) {
      throw AppError.forbidden("Not authorized to update this appointment");
    }
    return prisma.appointment.update({ where: { id }, data: { status: status as any } });
  }

  async getQueue(doctorId: string, organizationId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.appointment.findMany({
      where: {
        doctorId,
        date: { gte: today, lt: new Date(today.getTime() + 86400000) },
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        doctor: { organizationId },
      },
      include: {
        patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, dob: true, age: true, address: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { token: "asc" },
    });
  }

  async getTodayAll(organizationId: string) {
    return this.getByDate(undefined, organizationId);
  }

  async getByDate(dateStr: string | undefined, organizationId: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);
    if (isNaN(date.getTime())) {
      throw AppError.badRequest("Invalid date");
    }
    return prisma.appointment.findMany({
      where: {
        date: { gte: date, lt: new Date(date.getTime() + 86400000) },
        doctor: { organizationId },
      },
      include: {
        patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, dob: true, age: true, address: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { token: "asc" },
    });
  }
}

export const appointmentService = new AppointmentService();
