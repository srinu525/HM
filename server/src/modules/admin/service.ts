import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class AdminService {
  async getPlatformStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalOrgs, activeOrgs,
      totalUsers, activeUsers,
      totalPatients,
      todayAppointments,
      todaySaleRevenue,
      todayInvoiceRevenue,
      recentPatients,
      totalMedicines,
      recentUsers,
      activeSubscriptions,
      cancelledThisMonth,
      newSubsThisMonth,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { not: "SUPER_ADMIN" } } }),
      prisma.user.count({ where: { isActive: true, role: { not: "SUPER_ADMIN" } } }),
      prisma.patient.count(),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow } }, _sum: { total: true } }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow }, status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.patient.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.medicine.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo }, role: { not: "SUPER_ADMIN" } } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({
        where: { status: "CANCELLED", cancelledAt: { gte: startOfMonth } },
      }),
      prisma.subscription.count({ where: { createdAt: { gte: startOfMonth } } }),
    ]);

    const todayRevenue = (todaySaleRevenue._sum.total || 0) + (todayInvoiceRevenue._sum.amount || 0);

    // MRR from active subscriptions
    const activeSubs = await prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: { select: { price: true } } },
    });
    const mrr = activeSubs.reduce((sum, s) => sum + s.plan.price, 0);

    return {
      totalOrgs, activeOrgs,
      totalUsers, activeUsers,
      totalPatients,
      todayAppointments,
      todayRevenue,
      recentPatients,
      totalMedicines,
      recentUsers,
      activeSubscriptions,
      cancelledThisMonth,
      newSubsThisMonth,
      mrr,
      arr: mrr * 12,
    };
  }

  async getAllOrganizations() {
    return prisma.organization.findMany({
      include: {
        _count: { select: { users: true, patients: true, medicines: true } },
        subscriptions: { include: { plan: true }, where: { status: { in: ["ACTIVE", "TRIAL"] } }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOrganizationById(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, patients: true, medicines: true, notifications: true } },
        users: { select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true } },
        subscriptions: {
          include: {
            plan: true,
            history: { orderBy: { createdAt: "desc" }, take: 10 },
          },
          where: { status: { in: ["ACTIVE", "TRIAL", "CANCELLED"] } },
          take: 1,
        },
        featureFlags: true,
      },
    });
    if (!org) throw AppError.notFound("Organization not found");
    return org;
  }

  async createOrganization(data: {
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    timezone?: string;
    currency?: string;
  }) {
    const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (existing) throw AppError.badRequest("Slug already taken");
    return prisma.organization.create({ data });
  }

  async updateOrganization(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
      logo?: string;
      timezone?: string;
      currency?: string;
      gstVat?: string;
      hospitalLicense?: string;
      isActive?: boolean;
    }
  ) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw AppError.notFound("Organization not found");
    return prisma.organization.update({ where: { id }, data });
  }

  async deleteOrganization(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, patients: true } },
        subscriptions: { where: { status: "ACTIVE" }, take: 1 },
      },
    });
    if (!org) throw AppError.notFound("Organization not found");
    if (org.subscriptions.length > 0) {
      throw AppError.badRequest("Cannot delete an organization with an active subscription. Cancel it first.");
    }
    // Soft-delete by deactivating — for a hard delete you'd cascade manually
    return prisma.organization.update({ where: { id }, data: { isActive: false } });
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
    if (!user) throw AppError.notFound("User not found");
    if (user.role === "SUPER_ADMIN") throw AppError.badRequest("Cannot modify super admin");
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.role && { role: data.role as any }),
      },
    });
  }

  // Fixed: use groupBy to avoid N+1
  async getRevenueByOrg() {
    const orgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });

    // Sales revenue grouped by patient's org
    const salesByOrg = await prisma.sale.groupBy({
      by: ["patientId"],
      _sum: { total: true },
      _count: true,
    });

    // Map patientId → orgId
    const patients = await prisma.patient.findMany({
      select: { id: true, organizationId: true },
    });
    const patientOrgMap = new Map(patients.map((p) => [p.id, p.organizationId]));

    const salesOrgTotals = new Map<string, { revenue: number; sales: number }>();
    for (const s of salesByOrg) {
      const orgId = patientOrgMap.get(s.patientId);
      if (!orgId) continue;
      const prev = salesOrgTotals.get(orgId) ?? { revenue: 0, sales: 0 };
      salesOrgTotals.set(orgId, {
        revenue: prev.revenue + (s._sum.total ?? 0),
        sales: prev.sales + s._count,
      });
    }

    // Invoice payment revenue grouped by org
    const invoicePayments = await prisma.payment.groupBy({
      by: ["organizationId"],
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    });
    const invoiceOrgTotals = new Map(
      invoicePayments.map((p) => [p.organizationId, p._sum.amount ?? 0])
    );

    // Patient counts
    const patientCounts = await prisma.patient.groupBy({
      by: ["organizationId"],
      _count: true,
    });
    const patientCountMap = new Map(patientCounts.map((p) => [p.organizationId, p._count]));

    return orgs.map((org) => {
      const sales = salesOrgTotals.get(org.id) ?? { revenue: 0, sales: 0 };
      const invoiceRevenue = invoiceOrgTotals.get(org.id) ?? 0;
      return {
        orgId: org.id,
        name: org.name,
        slug: org.slug,
        salesRevenue: sales.revenue,
        invoiceRevenue,
        totalRevenue: sales.revenue + invoiceRevenue,
        totalSales: sales.sales,
        totalPatients: patientCountMap.get(org.id) ?? 0,
      };
    });
  }

  // Cross-org audit logs for super admin
  async getSystemAuditLogs(filters: {
    organizationId?: string;
    entity?: string;
    action?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = Math.min(filters.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.entity) where.entity = filters.entity;
    if (filters.action) where.action = { contains: filters.action, mode: "insensitive" };

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          organization: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getFeatureFlags(organizationId: string) {
    return prisma.featureFlag.findMany({ where: { organizationId } });
  }

  async setFeatureFlag(organizationId: string, key: string, isEnabled: boolean, name?: string, description?: string) {
    return prisma.featureFlag.upsert({
      where: { key_organizationId: { key, organizationId } },
      update: { isEnabled, ...(name && { name }), ...(description && { description }) },
      create: {
        key,
        name: name ?? key,
        description,
        isEnabled,
        organizationId,
      },
    });
  }

  async bulkSetFeatureFlags(organizationId: string, flags: { key: string; isEnabled: boolean }[]) {
    return Promise.all(
      flags.map((f) =>
        prisma.featureFlag.upsert({
          where: { key_organizationId: { key: f.key, organizationId } },
          update: { isEnabled: f.isEnabled },
          create: { key: f.key, name: f.key, isEnabled: f.isEnabled, organizationId },
        })
      )
    );
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
