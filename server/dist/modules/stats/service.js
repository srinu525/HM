import { prisma } from "../../utils/prisma";
export class StatsService {
    async getBasicStats(organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [totalPatients, todayAppointments, todayRevenue] = await Promise.all([
            prisma.patient.count({ where: { organizationId } }),
            prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
            prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _sum: { total: true } }),
        ]);
        return {
            totalPatients,
            todayAppointments,
            todayRevenue: todayRevenue._sum.total || 0,
        };
    }
    async getSystemStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalOrgs, activeOrgs, totalUsers, activeUsers, totalPatients, todayAppointments, todayRevenue, recentPatients, totalMedicines,] = await Promise.all([
            prisma.organization.count(),
            prisma.organization.count({ where: { isActive: true } }),
            prisma.user.count(),
            prisma.user.count({ where: { isActive: true } }),
            prisma.patient.count(),
            prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
            prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _sum: { total: true } }),
            prisma.patient.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.medicine.count({ where: { isActive: true } }),
        ]);
        return {
            totalOrgs, activeOrgs,
            totalUsers, activeUsers,
            totalPatients,
            todayAppointments,
            todayRevenue: todayRevenue._sum.total || 0,
            recentPatients,
            totalMedicines,
        };
    }
    async getSystemAnalytics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        const stats = [];
        const currentDate = new Date(thirtyDaysAgo);
        while (currentDate <= today) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            const [appointments, patients, revenue] = await Promise.all([
                prisma.appointment.count({ where: { date: { gte: currentDate, lt: nextDate } } }),
                prisma.patient.count({ where: { createdAt: { gte: currentDate, lt: nextDate } } }),
                prisma.sale.aggregate({ where: { createdAt: { gte: currentDate, lt: nextDate } }, _sum: { total: true } }),
            ]);
            stats.push({ date: currentDate.toISOString(), appointments, patients, revenue: revenue._sum.total || 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return stats;
    }
    async getAnalytics(organizationId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        const weeklyStats = await this.getDailyStats(sevenDaysAgo, today);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        const monthlyStats = await this.getDailyStats(thirtyDaysAgo, today);
        const basicStats = await this.getBasicStats(organizationId);
        return { ...basicStats, weeklyStats, monthlyStats };
    }
    async getDailyStats(startDate, endDate) {
        const stats = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const nextDate = new Date(currentDate);
            nextDate.setDate(nextDate.getDate() + 1);
            const [appointments, patients, revenue] = await Promise.all([
                prisma.appointment.count({ where: { date: { gte: currentDate, lt: nextDate } } }),
                prisma.patient.count({ where: { createdAt: { gte: currentDate, lt: nextDate } } }),
                prisma.sale.aggregate({ where: { createdAt: { gte: currentDate, lt: nextDate } }, _sum: { total: true } }),
            ]);
            stats.push({ date: currentDate.toISOString(), appointments, patients, revenue: revenue._sum.total || 0 });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return stats;
    }
    async getAppointmentHistory(filters, organizationId) {
        const where = {};
        if (filters?.doctorId) {
            where.doctorId = filters.doctorId;
        }
        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters?.startDate && filters?.endDate) {
            where.date = { gte: filters.startDate, lte: filters.endDate };
        }
        return prisma.appointment.findMany({
            where,
            include: {
                patient: { select: { id: true, patientId: true, name: true, phone: true } },
                doctor: { select: { id: true, name: true } },
                consultation: { include: { prescriptions: { include: { items: { include: { medicine: { select: { id: true, name: true } } } } } } } },
            },
            orderBy: { date: "desc" }, take: 100,
        });
    }
    async getSalesHistory(filters, organizationId) {
        const where = {};
        if (filters?.startDate && filters?.endDate) {
            where.createdAt = { gte: filters.startDate, lte: filters.endDate };
        }
        return prisma.sale.findMany({
            where,
            include: {
                items: { include: { medicine: { select: { id: true, name: true } } } },
                patient: { select: { id: true, patientId: true, name: true } },
            },
            orderBy: { createdAt: "desc" }, take: 100,
        });
    }
}
export const statsService = new StatsService();
//# sourceMappingURL=service.js.map