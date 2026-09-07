import { Router } from "express";
import { patientController } from "./controller";
import { authorizePermission } from "../permissions/middleware";

const router = Router();

// Any role with patients.read can list/view patients
router.get("/", authorizePermission("patients.read"), patientController.getAll);
router.get("/:id", authorizePermission("patients.read"), patientController.getById);

// patients.create / patients.update required for mutations
router.post("/", authorizePermission("patients.create"), patientController.create);
router.put("/:id", authorizePermission("patients.update"), patientController.update);

export default router;
