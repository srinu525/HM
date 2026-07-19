import { Router } from "express";
import { departmentController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("ADMIN"));

router.get("/", departmentController.getAll);
router.get("/:id", departmentController.getById);
router.post("/", departmentController.create);
router.put("/:id", departmentController.update);
router.put("/:id/toggle-active", departmentController.toggleActive);

export default router;
