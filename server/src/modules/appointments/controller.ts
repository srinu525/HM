import { Response, NextFunction } from "express";
import { appointmentService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class AppointmentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.create(req.body, req.user!.organizationId);
      sendCreated(res, appointment, "Appointment booked");
    } catch (error) {
      next(error);
    }
  }

  async getByDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getByDoctor(req.params.doctorId as string, req.user!.organizationId);
      sendSuccess(res, appointments, "Appointments fetched");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await appointmentService.updateStatus(req.params.id as string, req.body.status, req.user!.organizationId);
      sendSuccess(res, appointment, "Status updated");
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queue = await appointmentService.getQueue(req.params.doctorId as string, req.user!.organizationId);
      sendSuccess(res, queue, "Queue fetched");
    } catch (error) {
      next(error);
    }
  }

  async getTodayAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await appointmentService.getTodayAll(req.user!.organizationId);
      sendSuccess(res, appointments, "Today's appointments fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const appointmentController = new AppointmentController();
