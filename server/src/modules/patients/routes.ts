import { Router } from "express";
import { patientController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", patientController.getAll);
router.get("/:id", patientController.getById);
router.post("/", authorize("ADMIN", "RECEPTIONIST"), patientController.create);
router.put("/:id", authorize("ADMIN", "RECEPTIONIST"), patientController.update);

export default router;
