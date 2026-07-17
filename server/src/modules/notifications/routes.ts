import { Router } from "express";
import { notificationController } from "./controller";
// authenticate applied via app.ts mount

const router = Router();

router.get("/", notificationController.getByUser);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

export default router;
