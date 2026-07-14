import { Router } from "express";
import { statsController } from "./controller";
import { authenticate } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", statsController.getBasicStats);
router.get("/analytics", statsController.getAnalytics);
router.get("/appointments/history", statsController.getAppointmentHistory);
router.get("/sales/history", statsController.getSalesHistory);

export default router;
