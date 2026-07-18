import { Router } from "express";
import { notificationController } from "./controller";
import { authorize } from "../../middleware/auth";
const router = Router();
router.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), notificationController.getByUser);
router.get("/unread-count", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), notificationController.getUnreadCount);
router.put("/:id/read", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), notificationController.markAsRead);
router.put("/read-all", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), notificationController.markAllAsRead);
export default router;
//# sourceMappingURL=routes.js.map