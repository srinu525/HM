import { Response, NextFunction } from "express";
import { notificationService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";

export class NotificationController {
  async getByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getByUser(req.user!.id);
      sendSuccess(res, notifications, "Notifications fetched");
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.getUnreadCount(req.user!.id);
      sendSuccess(res, result, "Unread count fetched");
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string, req.user!.id);
      sendSuccess(res, notification, "Notification marked as read");
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, null, "All notifications marked as read");
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
