import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class NotificationController {
    getByUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=controller.d.ts.map