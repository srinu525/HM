import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
import { getIO } from "../../socket";

export class NotificationService {
  async create(userId: string, message: string, type: string, organizationId: string) {
    const notification = await prisma.notification.create({ data: { userId, message, type, organizationId } });
    try {
      getIO().to(`user:${userId}`).emit("notification:new", notification);
    } catch { /* socket not initialized */ }
    return notification;
  }

  async getByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId }, orderBy: { createdAt: "desc" }, take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) {
      throw new Error("Notification not found");
    }
    if (notification.userId !== userId) {
      throw new Error("Not authorized to update this notification");
    }
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false }, data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
