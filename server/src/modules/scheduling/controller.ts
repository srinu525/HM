import { Response, NextFunction } from "express";
import { schedulingService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class SchedulingController {
  async getSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulingService.getSchedule(req.params.userId as string);
      sendSuccess(res, schedule, "Schedule fetched");
    } catch (error) {
      next(error);
    }
  }

  async upsertSchedule(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedule = await schedulingService.upsertSchedule(
        req.params.userId as string,
        req.body
      );
      sendSuccess(res, schedule, "Schedule updated");
    } catch (error) {
      next(error);
    }
  }

  async getDoctorSchedules(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const schedules = await schedulingService.getDoctorSchedules(
        req.user!.organizationId as string
      );
      sendSuccess(res, schedules, "Doctor schedules fetched");
    } catch (error) {
      next(error);
    }
  }

  async getLeaveRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leaves = await schedulingService.getLeaveRequests(
        req.user!.organizationId as string,
        req.query.status as string | undefined
      );
      sendSuccess(res, leaves, "Leave requests fetched");
    } catch (error) {
      next(error);
    }
  }

  async createLeaveRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const targetUserId = (req.body.userId as string) || req.user!.id;
      const leave = await schedulingService.createLeaveRequest(
        targetUserId,
        req.body,
        req.user!.organizationId as string
      );
      sendCreated(res, leave, "Leave request created");
    } catch (error) {
      next(error);
    }
  }

  async updateLeaveStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const leave = await schedulingService.updateLeaveStatus(
        req.params.id as string,
        req.body.status,
        req.user!.id,
        req.user!.organizationId as string
      );
      sendSuccess(res, leave, "Leave status updated");
    } catch (error) {
      next(error);
    }
  }
}

export const schedulingController = new SchedulingController();
