import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class PlanService {
  async getAll() {
    return prisma.plan.findMany({
      where: { isActive: true },
      include: { _count: { select: { subscriptions: true } } },
      orderBy: { price: "asc" },
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

  async create(data: { name: string; description?: string; price: number; maxUsers: number; maxPatients: number; features: string[] }) {
    const existing = await prisma.plan.findUnique({ where: { name: data.name } });
    if (existing) throw AppError.badRequest("Plan name already exists");
    return prisma.plan.create({ data });
  }

  async update(id: string, data: { name?: string; description?: string; price?: number; maxUsers?: number; maxPatients?: number; features?: string[]; isActive?: boolean }) {
    const plan = await prisma.plan.findUnique({ where: { id } });
    if (!plan) throw AppError.notFound("Plan not found");
    return prisma.plan.update({ where: { id }, data });
  }

  async subscribe(organizationId: string, planId: string, months = 1) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw AppError.notFound("Plan not found");

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    const existing = await prisma.subscription.findFirst({
      where: { organizationId, status: "ACTIVE" },
    });
    if (existing) {
      throw AppError.badRequest("Organization already has an active subscription");
    }

    return prisma.subscription.create({
      data: {
        organizationId,
        planId,
        endDate,
        status: "ACTIVE",
      },
      include: { plan: true },
    });
  }

  async getOrgSubscription(organizationId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { organizationId, status: "ACTIVE" },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
    return sub;
  }

  async cancel(subscriptionId: string, organizationId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, organizationId },
    });
    if (!sub) throw AppError.notFound("Subscription not found");
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "CANCELLED" },
      include: { plan: true },
    });
  }
}

export const planService = new PlanService();
