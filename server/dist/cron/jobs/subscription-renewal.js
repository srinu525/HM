import { prisma } from "../../utils/prisma";
import { eventBus } from "../../common/event-bus";
import { logger } from "../../common/logger";
export async function runSubscriptionRenewalCheck() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringSubscriptions = await prisma.subscription.findMany({
        where: {
            status: "ACTIVE",
            endDate: { not: null, lte: sevenDaysFromNow, gte: now },
        },
        include: { plan: { select: { name: true } } },
    });
    const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
            status: "ACTIVE",
            endDate: { not: null, lt: now },
        },
        include: { plan: { select: { name: true } } },
    });
    logger.info({ expiringCount: expiringSubscriptions.length, expiredCount: expiredSubscriptions.length }, "Subscription renewal check completed");
    for (const sub of expiringSubscriptions) {
        await eventBus.emitEvent("subscription.expiring", {
            type: "subscription.expiring",
            payload: {
                subscriptionId: sub.id,
                endDate: sub.endDate,
                planName: sub.plan.name,
            },
            organizationId: sub.organizationId,
        });
    }
    for (const sub of expiredSubscriptions) {
        await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: "EXPIRED" },
        });
        await eventBus.emitEvent("subscription.expired", {
            type: "subscription.expired",
            payload: {
                subscriptionId: sub.id,
                planName: sub.plan.name,
            },
            organizationId: sub.organizationId,
        });
    }
}
//# sourceMappingURL=subscription-renewal.js.map