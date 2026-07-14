import { Response, NextFunction } from "express";
import { notificationService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class NotificationController {
  async getByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getByUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
