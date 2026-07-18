import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
export class AppointmentService {
    async create(data, organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastToken = await prisma.appointment.findFirst({
            where: {
                doctorId: data.doctorId,
                date: { gte: today, lt: new Date(today.getTime() + 86400000) },
            },
            orderBy: { token: "desc" },
        });
        const token = (lastToken?.token || 0) + 1;
        return prisma.appointment.create({
            data: {
                patientId: data.patientId, doctorId: data.doctorId, notes: data.notes,
                consultationFee: data.consultationFee || 0,
                validUntil: data.validUntil ? new Date(data.validUntil) : null, token,
            },
            include: {
                patient: { select: { id: true, patientId: true, name: true, phone: true } },
                doctor: { select: { id: true, name: true } },
            },
        });
    }
    async getByDoctor(doctorId, organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return prisma.appointment.findMany({
            where: {
                doctorId, date: { gte: today, lt: new Date(today.getTime() + 86400000) }
            },
            include: { patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true } } },
            orderBy: { token: "asc" },
        });
    }
    async updateStatus(id, status, organizationId) {
        const appointment = await prisma.appointment.findUnique({ where: { id } });
        if (!appointment) {
            throw AppError.notFound("Appointment not found");
        }
        return prisma.appointment.update({ where: { id }, data: { status: status } });
    }
    async getQueue(doctorId, organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return prisma.appointment.findMany({
            where: {
                doctorId, date: { gte: today, lt: new Date(today.getTime() + 86400000) },
                status: { in: ["SCHEDULED", "IN_PROGRESS"] },
            },
            include: { patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, dob: true, age: true } } },
            orderBy: { token: "asc" },
        });
    }
    async getTodayAll(organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return prisma.appointment.findMany({
            where: { date: { gte: today, lt: new Date(today.getTime() + 86400000) } },
            include: {
                patient: { select: { id: true, patientId: true, name: true, phone: true } },
                doctor: { select: { id: true, name: true } },
            },
            orderBy: { token: "asc" },
        });
    }
}
export const appointmentService = new AppointmentService();
//# sourceMappingURL=service.js.map