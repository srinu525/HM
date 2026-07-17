import { Router } from "express";
import { adminController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("SUPER_ADMIN"));

router.get("/stats", adminController.getPlatformStats);
router.get("/revenue", adminController.getRevenueByOrg);

router.get("/organizations", adminController.getAllOrganizations);
router.get("/organizations/:id", adminController.getOrganizationById);
router.post("/organizations", adminController.createOrganization);
router.put("/organizations/:id", adminController.updateOrganization);

router.get("/users", adminController.getAllUsers);
router.put("/users/:id", adminController.updateUser);

router.get("/organizations/:orgId/feature-flags", adminController.getFeatureFlags);
router.put("/organizations/:orgId/feature-flags", adminController.setFeatureFlag);

router.get("/settings", adminController.getPlatformSettings);
router.put("/settings", adminController.setPlatformSetting);

export default router;
