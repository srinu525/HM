import { Router } from "express";
import { appointmentController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "RECEPTIONIST"), appointmentController.create);
router.get("/", appointmentController.getTodayAll);
router.get("/doctor/:doctorId", appointmentController.getByDoctor);
router.get("/queue/:doctorId", authorize("DOCTOR"), appointmentController.getQueue);
router.put("/:id/status", appointmentController.updateStatus);

export default router;
