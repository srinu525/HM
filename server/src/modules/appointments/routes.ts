import { Router } from "express";
import { appointmentController } from "./controller";
import { authorizePermission } from "../permissions/middleware";

const router = Router();

router.post("/", authorizePermission("appointments.create"), appointmentController.create);
router.get("/", authorizePermission("appointments.read"), appointmentController.getTodayAll);
router.get("/by-date", authorizePermission("appointments.read"), appointmentController.getByDate);
router.get("/doctor/:doctorId", authorizePermission("appointments.read"), appointmentController.getByDoctor);
router.get("/queue/:doctorId", authorizePermission("appointments.read"), appointmentController.getQueue);
router.put("/:id/status", authorizePermission("appointments.update"), appointmentController.updateStatus);

export default router;
