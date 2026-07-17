import { Router } from "express";
import { statsController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authorize("ADMIN", "RECEPTIONIST"), statsController.getBasicStats);
router.get("/analytics", authorize("ADMIN", "RECEPTIONIST"), statsController.getAnalytics);
router.get("/appointments/history", authorize("ADMIN", "RECEPTIONIST"), statsController.getAppointmentHistory);
router.get("/sales/history", authorize("ADMIN", "RECEPTIONIST"), statsController.getSalesHistory);

router.get("/system", authorize("SUPER_ADMIN"), statsController.getSystemStats);
router.get("/system/analytics", authorize("SUPER_ADMIN"), statsController.getSystemAnalytics);

export default router;
