import { Router } from "express";
import { appointmentController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "RECEPTIONIST"), appointmentController.create);
router.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.getTodayAll);
router.get("/doctor/:doctorId", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.getByDoctor);
router.get("/queue/:doctorId", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.getQueue);
router.put("/:id/status", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.updateStatus);

export default router;
