import { Router } from "express";
import { orgSettingController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.use(authorize("ADMIN"));

router.get("/", orgSettingController.getAll);
router.get("/:key", orgSettingController.getByKey);
router.put("/", orgSettingController.upsert);
router.put("/bulk", orgSettingController.bulkUpsert);

export default router;
