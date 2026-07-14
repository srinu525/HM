import { Response, NextFunction } from "express";
import { consultationService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class ConsultationController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultation = await consultationService.create({
        ...req.body,
        doctorId: req.user!.id,
      });
      res.status(201).json(consultation);
    } catch (error) {
      next(error);
    }
  }

  async getByDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultations = await consultationService.getByDoctor(req.user!.id);
      res.json(consultations);
    } catch (error) {
      next(error);
    }
  }

  async getByPatient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultations = await consultationService.getByPatient(req.params.patientId);
      res.json(consultations);
    } catch (error) {
      next(error);
    }
  }
}

export const consultationController = new ConsultationController();
