import { Router } from "express";
import { planController } from "./controller";
import { authorize } from "../../middleware/auth";
const router = Router();
router.get("/plans", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), planController.getAll);
router.get("/plans/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), planController.getById);
router.post("/plans", authorize("SUPER_ADMIN"), planController.create);
router.put("/plans/:id", authorize("SUPER_ADMIN"), planController.update);
router.get("/subscription", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), planController.getOrgSubscription);
router.post("/subscription", authorize("ADMIN"), planController.subscribe);
router.put("/subscription/:id/cancel", authorize("ADMIN"), planController.cancel);
export default router;
//# sourceMappingURL=routes.js.map