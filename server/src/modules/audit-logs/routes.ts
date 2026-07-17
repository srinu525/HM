import { Router } from "express";
import { auditLogController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("SUPER_ADMIN", "ADMIN"));

router.get("/", auditLogController.getByOrganization);

export default router;
