import { Router } from "express";
import { consultationController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorize("DOCTOR"));

router.post("/", consultationController.create);
router.get("/", consultationController.getByDoctor);
router.get("/patient/:patientId", consultationController.getByPatient);

export default router;
