export declare class AuditLogService {
    log(data: {
        action: string;
        entity: string;
        entityId?: string;
        oldValue?: unknown;
        newValue?: unknown;
        ipAddress?: string;
        userAgent?: string;
        organizationId: string;
        userId?: string;
    }): Promise<{
        organizationId: string;
        userId: string | null;
        id: string;
        createdAt: Date;
        action: string;
        entity: string;
        entityId: string | null;
        oldValue: import("@prisma/client/runtime/client").JsonValue | null;
        newValue: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    getByOrganization(organizationId: string, filters: {
        entity?: string;
        action?: string;
        userId?: string;
    }, page?: number, limit?: number): Promise<{
        logs: {
            organizationId: string;
            userId: string | null;
            id: string;
            createdAt: Date;
            action: string;
            entity: string;
            entityId: string | null;
            oldValue: import("@prisma/client/runtime/client").JsonValue | null;
            newValue: import("@prisma/client/runtime/client").JsonValue | null;
            ipAddress: string | null;
            userAgent: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
export declare const auditLogService: AuditLogService;
//# sourceMappingURL=service.d.ts.map