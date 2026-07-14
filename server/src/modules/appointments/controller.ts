import { Response, NextFunction } from "express";
import { appointmentService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class AppointmentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.create(req.body);
      res.status(201).json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async getByDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getByDoctor(req.params.doctorId as string);
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.updateStatus(req.params.id as string, req.body.status);
      res.json(appointment);
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queue = await appointmentService.getQueue(req.params.doctorId as string);
      res.json(queue);
    } catch (error) {
      next(error);
    }
  }

  async getTodayAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getTodayAll();
      res.json(appointments);
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
