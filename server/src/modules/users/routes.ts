import { Router } from "express";
import { userController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/doctors", userController.getDoctors);

router.use(authorize("ADMIN"));

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);

export default router;
