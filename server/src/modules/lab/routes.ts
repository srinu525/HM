import { Router } from "express";
import { labController } from "./controller";
import { authorizePermission } from "../permissions/middleware";

const router = Router();

router.get("/tests", authorizePermission("lab.read"), labController.getTests);
router.post("/tests", authorizePermission("lab.create"), labController.createTest);
router.put("/tests/:id", authorizePermission("lab.update"), labController.updateTest);

router.get("/results", authorizePermission("lab.read"), labController.getResults);
router.post("/results", authorizePermission("lab.create"), labController.createResult);
router.put("/results/:id", authorizePermission("lab.update"), labController.updateResult);

export default router;
