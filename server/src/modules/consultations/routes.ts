import { Router } from "express";
import { consultationController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.post("/", authorize("DOCTOR"), consultationController.create);

router.get("/", authorize("DOCTOR"), consultationController.getByDoctor);
router.get("/completed-today", authorize("DOCTOR"), consultationController.getTodayCompleted);
router.get("/patient/:patientId", authorize("DOCTOR"), consultationController.getByPatient);

export default router;
