import { Router } from "express";
import { labController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/tests", authorize("DOCTOR", "PHARMACIST"), labController.getTests);
router.post("/tests", authorize("DOCTOR"), labController.createTest);
router.put("/tests/:id", authorize("DOCTOR"), labController.updateTest);

router.get("/results", authorize("DOCTOR", "PHARMACIST"), labController.getResults);
router.post("/results", authorize("DOCTOR"), labController.createResult);
router.put("/results/:id", authorize("DOCTOR"), labController.updateResult);

export default router;
