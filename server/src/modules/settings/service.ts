import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class OrgSettingService {
  async getAll(organizationId: string, category?: string) {
    const where: any = { organizationId };
    if (category) { where.category = category; }

    return prisma.orgSetting.findMany({
      where,
      orderBy: { key: "asc" },
    });
  }

  async getByKey(key: string, organizationId: string) {
    const setting = await prisma.orgSetting.findUnique({
      where: { key_organizationId: { key, organizationId } },
    });
    if (!setting) { throw AppError.notFound(`Setting "${key}" not found`); }
    return setting;
  }

  async upsert(key: string, value: string, category: string | undefined, organizationId: string) {
    return prisma.orgSetting.upsert({
      where: { key_organizationId: { key, organizationId } },
      create: { key, value, category: category ?? "general", organizationId },
      update: { value, ...(category ? { category } : {}) },
    });
  }

  async bulkUpsert(settings: { key: string; value: string; category?: string }[], organizationId: string) {
    const results = [];
    for (const s of settings) {
      const result = await prisma.orgSetting.upsert({
        where: { key_organizationId: { key: s.key, organizationId } },
        create: { key: s.key, value: s.value, category: s.category ?? "general", organizationId },
        update: { value: s.value, ...(s.category ? { category: s.category } : {}) },
      });
      results.push(result);
    }
    return results;
  }
}

export const orgSettingService = new OrgSettingService();
