import { prisma } from "../../utils/prisma";

export class StatsService {
  async getBasicStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, todayAppointments, todayRevenue] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow } },
        _sum: { total: true },
      }),
    ]);

    return {
      totalPatients,
      todayAppointments,
      todayRevenue: todayRevenue._sum.total || 0,
    };
  }

  async getAnalytics() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get stats for last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyStats = await this.getDailyStats(sevenDaysAgo, today);

    // Get stats for last 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const monthlyStats = await this.getDailyStats(thirtyDaysAgo, today);

    const basicStats = await this.getBasicStats();

    return {
      ...basicStats,
      weeklyStats,
      monthlyStats,
    };
  }

  private async getDailyStats(startDate: Date, endDate: Date) {
    const stats = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);

      const [appointments, patients, revenue] = await Promise.all([
        prisma.appointment.count({
          where: { date: { gte: currentDate, lt: nextDate } },
        }),
        prisma.patient.count({
          where: { createdAt: { gte: currentDate, lt: nextDate } },
        }),
        prisma.sale.aggregate({
          where: { createdAt: { gte: currentDate, lt: nextDate } },
          _sum: { total: true },
        }),
      ]);

      stats.push({
        date: currentDate.toISOString(),
        appointments,
        patients,
        revenue: revenue._sum.total || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return stats;
  }

  async getAppointmentHistory(filters?: { doctorId?: string; patientId?: string; startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (filters?.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters?.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            patientId: true,
            name: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        consultation: {
          include: {
            prescriptions: {
              include: {
                items: {
                  include: {
                    medicine: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
      take: 100,
    });
  }

  async getSalesHistory(filters?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (filters?.startDate && filters?.endDate) {
      where.createdAt = {
        gte: filters.startDate,
        lte: filters.endDate,
      };
    }

    return prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            medicine: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            patientId: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}

export const statsService = new StatsService();