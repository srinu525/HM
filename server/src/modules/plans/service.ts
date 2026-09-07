import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export const BASE_MODULES = ["reception", "doctor", "pharmacy", "admin"] as const;

export class PlanService {
  async getAll() {
    return prisma.plan.findMany({
      include: { _count: { select: { subscriptions: true } } },
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });
  }

  async getById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: { _count: { select: { subscriptions: true } } },
    });
    if (!plan) throw AppError.notFound("Plan not found");
    return plan;
  }

  async create(data: {
    name: string;
    description?: string;
    price?: number;
    yearlyPrice?: number;
    billingCycle?: string;
    maxUsers?: number;
    maxDoctors?: number;
    trialDays?: number;
    modules?: string[];
    features?: string[];
    sortOrder?: number;
  }) {
    const existing = await prisma.plan.findUnique({ where: { name: data.name } });
    if (existing) throw AppError.badRequest("Plan name already exists");
    return prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price ?? 0,
        yearlyPrice: data.yearlyPrice,
        billingCycle: data.billingCycle ?? "MONTHLY",
        maxUsers: data.maxUsers ?? 5,
        maxDoctors: data.maxDoctors ?? 1,
        trialDays: data.trialDays ?? 0,
        modules: data.modules ?? [],
        features: data.features ?? [],
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number;
      yearlyPrice?: number;
      billingCycle?: string;
      maxUsers?: number;
      maxDoctors?: number;
      trialDays?: number;
      modules?: string[];
      features?: string[];
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) throw AppError.notFound("Plan not found");
    return prisma.plan.update({ where: { id }, data });
  }

  async subscribe(organizationId: string, planId: string, months = 1, cycle = "MONTHLY") {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw AppError.notFound("Plan not found");
    if (!plan.isActive) throw AppError.badRequest("Plan is not active");

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    // Determine if this is a trial
    const isFreePlan = plan.price === 0;
    const isTrial = plan.trialDays > 0 && !isFreePlan;
    const trialEndsAt = isTrial
      ? new Date(Date.now() + plan.trialDays * 86400000)
      : undefined;
    const status = isTrial ? "TRIAL" : "ACTIVE";

    const existing = await prisma.subscription.findUnique({ where: { organizationId } });

    if (existing) {
      const fromPlan = await prisma.plan.findUnique({ where: { id: existing.planId } });
      const action =
        existing.planId === planId
          ? "RENEWED"
          : (plan.price > (fromPlan?.price ?? 0) ? "UPGRADED" : "DOWNGRADED");

      const updated = await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          endDate,
          trialEndsAt: trialEndsAt ?? null,
          cycle,
          status,
          renewedAt: action === "RENEWED" ? new Date() : existing.renewedAt,
          cancelledAt: null,
        },
        include: { plan: true },
      });

      // Record history
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: existing.id,
          organizationId,
          action,
          fromPlanId: existing.planId,
          fromPlanName: fromPlan?.name,
          toPlanId: planId,
          toPlanName: plan.name,
          cycle,
        },
      });

      return updated;
    }

    const created = await prisma.subscription.create({
      data: {
        organizationId,
        planId,
        endDate,
        trialEndsAt: trialEndsAt ?? null,
        cycle,
        status,
      },
      include: { plan: true },
    });

    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: created.id,
        organizationId,
        action: isTrial ? "TRIAL_STARTED" : "SUBSCRIBED",
        toPlanId: planId,
        toPlanName: plan.name,
        cycle,
      },
    });

    return created;
  }

  async getOrgSubscription(organizationId: string) {
    return prisma.subscription.findUnique({
      where: { organizationId },
      include: {
        plan: true,
        history: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  }

  async cancel(subscriptionId: string, organizationId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, organizationId },
      include: { plan: true },
    });
    if (!sub) throw AppError.notFound("Subscription not found");

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED", cancelledAt: new Date(), autoRenew: false },
      include: { plan: true },
    });

    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId,
        organizationId,
        action: "CANCELLED",
        fromPlanId: sub.planId,
        fromPlanName: sub.plan.name,
        cycle: sub.cycle,
      },
    });

    return updated;
  }

  // ─── All subscriptions (super admin) ────────────────────────────────────────

  async getAllSubscriptions() {
    return prisma.subscription.findMany({
      include: {
        plan: true,
        organization: { select: { id: true, name: true, slug: true, isActive: true } },
        history: { orderBy: { createdAt: "desc" }, take: 5 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async forceAssign(organizationId: string, planId: string, months = 1, note?: string) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw AppError.notFound("Plan not found");

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const existing = await prisma.subscription.findUnique({ where: { organizationId } });

    if (existing) {
      const fromPlan = await prisma.plan.findUnique({ where: { id: existing.planId } });
      const updated = await prisma.subscription.update({
        where: { organizationId },
        data: { planId, endDate, status: "ACTIVE", cancelledAt: null, renewedAt: new Date() },
        include: { plan: true },
      });
      await prisma.subscriptionHistory.create({
        data: {
          subscriptionId: existing.id,
          organizationId,
          action: "UPGRADED",
          fromPlanId: existing.planId,
          fromPlanName: fromPlan?.name,
          toPlanId: planId,
          toPlanName: plan.name,
          cycle: existing.cycle,
          note: note ?? "Assigned by super admin",
        },
      });
      return updated;
    }

    const created = await prisma.subscription.create({
      data: { organizationId, planId, endDate, status: "ACTIVE" },
      include: { plan: true },
    });
    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: created.id,
        organizationId,
        action: "SUBSCRIBED",
        toPlanId: planId,
        toPlanName: plan.name,
        cycle: "MONTHLY",
        note: note ?? "Assigned by super admin",
      },
    });
    return created;
  }

  async forceCancel(organizationId: string, note?: string) {
    const sub = await prisma.subscription.findUnique({
      where: { organizationId },
      include: { plan: true },
    });
    if (!sub) throw AppError.notFound("No subscription for this organization");

    const updated = await prisma.subscription.update({
      where: { organizationId },
      data: { status: "CANCELLED", cancelledAt: new Date(), autoRenew: false },
      include: { plan: true },
    });

    await prisma.subscriptionHistory.create({
      data: {
        subscriptionId: sub.id,
        organizationId,
        action: "CANCELLED",
        fromPlanId: sub.planId,
        fromPlanName: sub.plan.name,
        cycle: sub.cycle,
        note: note ?? "Cancelled by super admin",
      },
    });

    return updated;
  }

  // ─── Add-ons ─────────────────────────────────────────────────────────────────

  async getAddons() {
    return prisma.planAddon.findMany({ orderBy: { price: "asc" } });
  }

  async createAddon(data: { name: string; description?: string; price?: number; module: string }) {
    const existing = await prisma.planAddon.findUnique({ where: { name: data.name } });
    if (existing) throw AppError.badRequest("Add-on name already exists");
    return prisma.planAddon.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price ?? 0,
        module: data.module,
      },
    });
  }

  async updateAddon(
    id: string,
    data: { name?: string; description?: string; price?: number; module?: string; isActive?: boolean }
  ) {
    const addon = await prisma.planAddon.findUnique({ where: { id } });
    if (!addon) throw AppError.notFound("Add-on not found");
    return prisma.planAddon.update({ where: { id }, data });
  }

  async deleteAddon(id: string) {
    const addon = await prisma.planAddon.findUnique({ where: { id } });
    if (!addon) throw AppError.notFound("Add-on not found");
    await prisma.orgAddon.deleteMany({ where: { addonId: id } });
    return prisma.planAddon.delete({ where: { id } });
  }

  async getOrgAddons(organizationId: string) {
    return prisma.orgAddon.findMany({
      where: { organizationId },
      include: { addon: true },
    });
  }

  async addOrgAddon(organizationId: string, addonId: string) {
    const addon = await prisma.planAddon.findUnique({ where: { id: addonId } });
    if (!addon) throw AppError.notFound("Add-on not found");
    const existing = await prisma.orgAddon.findUnique({
      where: { organizationId_addonId: { organizationId, addonId } },
    });
    if (existing) throw AppError.badRequest("Add-on already added");
    return prisma.orgAddon.create({
      data: { organizationId, addonId },
      include: { addon: true },
    });
  }

  async removeOrgAddon(organizationId: string, addonId: string) {
    const existing = await prisma.orgAddon.findUnique({
      where: { organizationId_addonId: { organizationId, addonId } },
    });
    if (!existing) throw AppError.notFound("Add-on not found on this organization");
    return prisma.orgAddon.delete({
      where: { organizationId_addonId: { organizationId, addonId } },
    });
  }
}

export const planService = new PlanService();
