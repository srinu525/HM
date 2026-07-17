import { Response, NextFunction } from "express";
import { statsService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";

export class StatsController {
  async getBasicStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getBasicStats(req.user!.organizationId as string);
      sendSuccess(res, stats, "Stats fetched");
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getSystemStats();
      sendSuccess(res, stats, "System stats fetched");
    } catch (error) {
      next(error);
    }
  }

  async getSystemAnalytics(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await statsService.getSystemAnalytics();
      sendSuccess(res, analytics, "System analytics fetched");
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await statsService.getAnalytics(req.user!.organizationId as string);
      sendSuccess(res, analytics, "Analytics fetched");
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { doctorId, patientId, startDate, endDate } = req.query;
      const filters: Record<string, unknown> = {};
      if (doctorId) filters.doctorId = doctorId as string;
      if (patientId) filters.patientId = patientId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const history = await statsService.getAppointmentHistory(filters, req.user!.organizationId as string);
      sendSuccess(res, history, "Appointment history fetched");
    } catch (error) {
      next(error);
    }
  }

  async getSalesHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const filters: Record<string, unknown> = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const history = await statsService.getSalesHistory(filters, req.user!.organizationId as string);
      sendSuccess(res, history, "Sales history fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();
