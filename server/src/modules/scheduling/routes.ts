import { Router } from "express";
import { schedulingController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/schedule/:userId", authorize("ADMIN", "DOCTOR"), schedulingController.getSchedule);
router.put("/schedule/:userId", authorize("ADMIN"), schedulingController.upsertSchedule);
router.get("/doctors", authorize("ADMIN"), schedulingController.getDoctorSchedules);
router.get("/leaves", authorize("ADMIN"), schedulingController.getLeaveRequests);
router.post("/leaves", authorize("ADMIN", "DOCTOR", "RECEPTIONIST"), schedulingController.createLeaveRequest);
router.put("/leaves/:id", authorize("ADMIN"), schedulingController.updateLeaveStatus);

export default router;
