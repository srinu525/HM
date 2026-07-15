import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class NotificationService {
  async create(userId: string, message: string, type: string, organizationId: string) {
    return prisma.notification.create({ data: { userId, message, type, organizationId } });
  }

  async getByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId }, orderBy: { createdAt: "desc" }, take: 20,
    });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false }, data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
