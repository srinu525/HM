import { Response, NextFunction } from "express";
import { statsService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";

export class StatsController {
  async getBasicStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getBasicStats(req.user!.organizationId);
      sendSuccess(res, stats, "Stats fetched");
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await statsService.getAnalytics(req.user!.organizationId);
      sendSuccess(res, analytics, "Analytics fetched");
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId, patientId, startDate, endDate } = req.query;
      const filters: any = {};
      if (doctorId) filters.doctorId = doctorId as string;
      if (patientId) filters.patientId = patientId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const history = await statsService.getAppointmentHistory(filters, req.user!.organizationId);
      sendSuccess(res, history, "Appointment history fetched");
    } catch (error) {
      next(error);
    }
  }

  async getSalesHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const history = await statsService.getSalesHistory(filters, req.user!.organizationId);
      sendSuccess(res, history, "Sales history fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
