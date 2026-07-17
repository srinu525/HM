import { Router } from "express";
import { planController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/plans", planController.getAll);
router.get("/plans/:id", planController.getById);
router.post("/plans", authorize("SUPER_ADMIN"), planController.create);
router.put("/plans/:id", authorize("SUPER_ADMIN"), planController.update);

router.get("/subscription", planController.getOrgSubscription);
router.post("/subscription", planController.subscribe);
router.put("/subscription/:id/cancel", planController.cancel);

export default router;
