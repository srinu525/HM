import { prisma } from "../../utils/prisma";

export class AdminService {
  async getPlatformStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalOrgs, activeOrgs,
      totalUsers, activeUsers,
      totalPatients,
      todayAppointments,
      todayRevenue,
      recentPatients,
      totalMedicines,
      recentUsers,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      prisma.user.count({ where: { isActive: true, role: { not: "SUPER_ADMIN" } } }),
      prisma.patient.count(),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _sum: { total: true } }),
      prisma.patient.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.medicine.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, role: { not: "SUPER_ADMIN" } } }),
    ]);

    return {
      totalOrgs, activeOrgs,
      totalUsers, activeUsers,
      totalPatients,
      todayAppointments,
      todayRevenue: todayRevenue._sum.total || 0,
      recentPatients,
      totalMedicines,
      recentUsers,
    };
  }

  async getAllOrganizations() {
    return prisma.organization.findMany({
      include: {
        _count: { select: { users: true, patients: true, medicines: true } },
        subscriptions: { include: { plan: true }, where: { status: "ACTIVE" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrganizationById(id: string) {
    return prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, patients: true, medicines: true, notifications: true } },
        users: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
        subscriptions: { include: { plan: true }, where: { status: "ACTIVE" }, take: 1 },
      },
    });
  }

  async createOrganization(data: { name: string; slug: string; email?: string; phone?: string; address?: string }) {
    const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (existing) throw new Error("Slug already taken");
    return prisma.organization.create({ data });
  }

  async updateOrganization(id: string, data: { name?: string; email?: string; phone?: string; address?: string; isActive?: boolean }) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw new Error("Organization not found");
    return prisma.organization.update({ where: { id }, data });
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, phone: true,
        isActive: true, createdAt: true, organizationId: true,
        organization: { select: { id: true, name: true, slug: true } },
      },
      where: { role: { not: "SUPER_ADMIN" } },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateUser(userId: string, data: { isActive?: boolean; role?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    if (user.role === "SUPER_ADMIN") throw new Error("Cannot modify super admin");
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.role && { role: data.role as any }),
      },
    });
  }

  async getRevenueByOrg() {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });

    const results = [];
    for (const org of orgs) {
      const revenue = await prisma.sale.aggregate({
        where: { patient: { organizationId: org.id } },
        _sum: { total: true },
        _count: true,
      });
      const patients = await prisma.patient.count({ where: { organizationId: org.id } });
      results.push({
        orgId: org.id,
        name: org.name,
        slug: org.slug,
        totalRevenue: revenue._sum.total || 0,
        totalSales: revenue._count,
        totalPatients: patients,
      });
    }
    return results;
  }

  async getFeatureFlags(organizationId: string) {
    return prisma.featureFlag.findMany({ where: { organizationId } });
  }

  async setFeatureFlag(organizationId: string, key: string, isEnabled: boolean) {
    return prisma.featureFlag.upsert({
      where: { key_organizationId: { key, organizationId } },
      update: { isEnabled },
      create: { key, name: key, isEnabled, organizationId },
    });
  }

  async getPlatformSettings() {
    return prisma.platformSetting.findMany();
  }

  async setPlatformSetting(key: string, value: string, category?: string) {
    return prisma.platformSetting.upsert({
      where: { key },
      update: { value, category: category || "general" },
      create: { key, value, category: category || "general" },
    });
  }
}

export const adminService = new AdminService();
