import { Router } from "express";
import { organizationController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("SUPER_ADMIN"));

router.get("/", organizationController.getAll);
router.get("/:id", organizationController.getById);
router.post("/", organizationController.create);
router.put("/:id", organizationController.update);
router.get("/:id/stats", organizationController.getStats);

export default router;
