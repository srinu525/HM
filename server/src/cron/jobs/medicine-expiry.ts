import { prisma } from "../../utils/prisma";
import { eventBus } from "../../common/event-bus";
import { logger } from "../../common/logger";

export async function runMedicineExpiryCheck() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringMedicines = await prisma.medicine.findMany({
    where: {
      isActive: true,
      expiryDate: { not: null, lte: thirtyDaysFromNow, gte: now },
    },
    select: { id: true, name: true, expiryDate: true, organizationId: true },
  });

  const expiredMedicines = await prisma.medicine.findMany({
    where: {
      isActive: true,
      expiryDate: { not: null, lt: now },
    },
    select: { id: true, name: true, expiryDate: true, organizationId: true },
  });

  logger.info({ expiringCount: expiringMedicines.length, expiredCount: expiredMedicines.length }, "Medicine expiry check completed");

  const orgMap = new Map<string, { id: string; name: string; expiryDate: Date | null }[]>();
  for (const med of expiringMedicines) {
    if (!orgMap.has(med.organizationId)) orgMap.set(med.organizationId, []);
    orgMap.get(med.organizationId)!.push(med);
  }

  for (const [orgId, medicines] of orgMap) {
    await eventBus.emitEvent("medicine.expiring", {
      type: "medicine.expiring",
      payload: { medicines },
      organizationId: orgId,
    });
  }

  if (expiredMedicines.length > 0) {
    const expiredOrgMap = new Map<string, { id: string; name: string; expiryDate: Date | null }[]>();
    for (const med of expiredMedicines) {
      if (!expiredOrgMap.has(med.organizationId)) expiredOrgMap.set(med.organizationId, []);
      expiredOrgMap.get(med.organizationId)!.push(med);
    }

    for (const [orgId, medicines] of expiredOrgMap) {
      await eventBus.emitEvent("medicine.expired", {
        type: "medicine.expired",
        payload: { medicines },
        organizationId: orgId,
      });
    }
  }
}
