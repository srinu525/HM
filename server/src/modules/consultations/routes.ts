import { Router } from "express";
import { consultationController } from "./controller";
import { authorizePermission } from "../permissions/middleware";

const router = Router();

router.post("/", authorizePermission("consultations.create"), consultationController.create);
router.get("/", authorizePermission("consultations.read"), consultationController.getByDoctor);
router.get("/certificates/:consultationId", authorizePermission("consultations.read"), consultationController.downloadCertificate);
router.get("/completed-today", authorizePermission("consultations.read"), consultationController.getTodayCompleted);
router.get("/patient/:patientId", authorizePermission("consultations.read"), consultationController.getByPatient);

export default router;
