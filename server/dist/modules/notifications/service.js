import { prisma } from "../../utils/prisma";
import { getIO } from "../../socket";
export class NotificationService {
    async create(userId, message, type, organizationId) {
        const notification = await prisma.notification.create({ data: { userId, message, type, organizationId } });
        try {
            getIO().to(`user:${userId}`).emit("notification:new", notification);
        }
        catch { /* socket not initialized */ }
        return notification;
    }
    async getByUser(userId) {
        return prisma.notification.findMany({
            where: { userId }, orderBy: { createdAt: "desc" }, take: 50,
        });
    }
    async getUnreadCount(userId) {
        const count = await prisma.notification.count({ where: { userId, isRead: false } });
        return { count };
    }
    async markAsRead(id, userId) {
        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification) {
            throw new Error("Notification not found");
        }
        if (notification.userId !== userId) {
            throw new Error("Not authorized to update this notification");
        }
        return prisma.notification.update({ where: { id }, data: { isRead: true } });
    }
    async markAllAsRead(userId) {
        return prisma.notification.updateMany({
            where: { userId, isRead: false }, data: { isRead: true },
        });
    }
}
export const notificationService = new NotificationService();
//# sourceMappingURL=service.js.map