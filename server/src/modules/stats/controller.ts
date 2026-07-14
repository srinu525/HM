import { Response, NextFunction } from "express";
import { statsService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class StatsController {
  async getBasicStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getBasicStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await statsService.getAnalytics();
      res.json(analytics);
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

      const history = await statsService.getAppointmentHistory(filters);
      res.json(history);
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

      const history = await statsService.getSalesHistory(filters);
      res.json(history);
    } catch (error) {
      next(error);
    }
  }
}

export const statsController = new StatsController();