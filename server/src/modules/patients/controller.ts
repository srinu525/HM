import { Response, NextFunction } from "express";
import { patientService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class PatientController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.create(req.body);
      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const patients = await patientService.getAll(search);
      res.json(patients);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.getById(req.params.id as string);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.update(req.params.id as string, req.body);
      res.json(patient);
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
