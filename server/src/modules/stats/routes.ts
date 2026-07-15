import { Router } from "express";
import { statsController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();
router.use(authenticate);
router.use(authorize("ADMIN", "SUPER_ADMIN", "RECEPTIONIST"));

router.get("/", statsController.getBasicStats);
router.get("/analytics", statsController.getAnalytics);
router.get("/appointments/history", statsController.getAppointmentHistory);
router.get("/sales/history", statsController.getSalesHistory);

export default router;
