import { Router } from "express";
import { planController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/plans", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), planController.getAll);
router.get("/plans/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), planController.getById);
router.post("/plans", authorize("SUPER_ADMIN"), planController.create);
router.put("/plans/:id", authorize("SUPER_ADMIN"), planController.update);

router.get("/addons", authorize("ADMIN", "SUPER_ADMIN"), planController.getAddons);
router.post("/addons", authorize("SUPER_ADMIN"), planController.createAddon);
router.put("/addons/:id", authorize("SUPER_ADMIN"), planController.updateAddon);
router.delete("/addons/:id", authorize("SUPER_ADMIN"), planController.deleteAddon);

router.get("/org-addons", authorize("ADMIN", "SUPER_ADMIN"), planController.getOrgAddons);
router.post("/org-addons", authorize("ADMIN", "SUPER_ADMIN"), planController.addOrgAddon);
router.delete("/org-addons/:addonId", authorize("ADMIN", "SUPER_ADMIN"), planController.removeOrgAddon);

router.get("/subscription", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), planController.getOrgSubscription);
router.post("/subscription", authorize("ADMIN"), planController.subscribe);
router.put("/subscription/:id/cancel", authorize("ADMIN"), planController.cancel);

// Super admin: cross-org subscription management
router.get("/all-subscriptions", authorize("SUPER_ADMIN"), planController.getAllSubscriptions);
router.put("/orgs/:orgId/subscription/assign", authorize("SUPER_ADMIN"), planController.forceAssign);
router.put("/orgs/:orgId/subscription/cancel", authorize("SUPER_ADMIN"), planController.forceCancel);

export default router;
