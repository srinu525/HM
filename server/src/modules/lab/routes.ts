import { Router } from "express";
import { labController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/tests", labController.getTests);
router.post("/tests", authorize("ADMIN", "DOCTOR"), labController.createTest);
router.put("/tests/:id", authorize("ADMIN"), labController.updateTest);

router.get("/results", labController.getResults);
router.post("/results", authorize("ADMIN", "DOCTOR"), labController.createResult);
router.put("/results/:id", authorize("ADMIN", "DOCTOR"), labController.updateResult);

export default router;
