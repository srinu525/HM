import { Router } from "express";
import { consultationController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("DOCTOR"));

router.post("/", consultationController.create);
router.get("/", consultationController.getByDoctor);
router.get("/completed-today", consultationController.getTodayCompleted);
router.get("/patient/:patientId", consultationController.getByPatient);

export default router;
