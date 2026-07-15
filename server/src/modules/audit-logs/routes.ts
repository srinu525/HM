import { Router } from "express";
import { auditLogController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorize("SUPER_ADMIN", "ADMIN"));

router.get("/", auditLogController.getByOrganization);

export default router;
