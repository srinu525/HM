import { Router } from "express";
import { notificationController } from "./controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", notificationController.getByUser);
router.get("/unread-count", notificationController.getUnreadCount);
router.put("/:id/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

export default router;
