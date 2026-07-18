export declare class NotificationService {
    create(userId: string, message: string, type: string, organizationId: string): Promise<{
        message: string;
        type: string;
        organizationId: string;
        userId: string;
        id: string;
        createdAt: Date;
        isRead: boolean;
    }>;
    getByUser(userId: string): Promise<{
        message: string;
        type: string;
        organizationId: string;
        userId: string;
        id: string;
        createdAt: Date;
        isRead: boolean;
    }[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        message: string;
        type: string;
        organizationId: string;
        userId: string;
        id: string;
        createdAt: Date;
        isRead: boolean;
    }>;
    markAllAsRead(userId: string): Promise<import("@prisma/client").Prisma.BatchPayload>;
}
export declare const notificationService: NotificationService;
//# sourceMappingURL=service.d.ts.map