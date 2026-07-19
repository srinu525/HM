import { Router } from "express";
import { permissionController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("ADMIN"));

router.get("/", permissionController.getAll);
router.get("/roles/:role", permissionController.getRolePermissions);
router.put("/roles/:role", permissionController.setRolePermissions);
router.get("/users/:userId", permissionController.getUserPermissions);
router.put("/users/:userId", permissionController.setUserPermissions);
router.post("/seed", permissionController.seedPermissions);

export default router;
