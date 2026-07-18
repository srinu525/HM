import { prisma } from "../../utils/prisma";
export class AuditLogService {
    async log(data) {
        return prisma.auditLog.create({
            data: {
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
                oldValue: data.oldValue,
                newValue: data.newValue,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                organizationId: data.organizationId,
                userId: data.userId,
            },
        });
    }
    async getByOrganization(organizationId, filters, page = 1, limit = 50) {
        const where = { organizationId };
        if (filters.entity)
            where.entity = filters.entity;
        if (filters.action)
            where.action = filters.action;
        if (filters.userId)
            where.userId = filters.userId;
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);
        return { logs, total, page, limit };
    }
}
export const auditLogService = new AuditLogService();
//# sourceMappingURL=service.js.map