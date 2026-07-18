import { notificationService } from "./service";
import { sendSuccess } from "../../common/response";
export class NotificationController {
    async getByUser(req, res, next) {
        try {
            const notifications = await notificationService.getByUser(req.user.id);
            sendSuccess(res, notifications, "Notifications fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getUnreadCount(req, res, next) {
        try {
            const result = await notificationService.getUnreadCount(req.user.id);
            sendSuccess(res, result, "Unread count fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const notification = await notificationService.markAsRead(req.params.id, req.user.id);
            sendSuccess(res, notification, "Notification marked as read");
        }
        catch (error) {
            next(error);
        }
    }
    async markAllAsRead(req, res, next) {
        try {
            await notificationService.markAllAsRead(req.user.id);
            sendSuccess(res, null, "All notifications marked as read");
        }
        catch (error) {
            next(error);
        }
    }
}
export const notificationController = new NotificationController();
//# sourceMappingURL=controller.js.map