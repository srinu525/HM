import { Response, NextFunction } from "express";
import { patientService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class PatientController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.create(req.body, req.user!.organizationId);
      sendCreated(res, patient, "Patient registered successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const patients = await patientService.getAll(search, req.user!.organizationId);
      sendSuccess(res, patients, "Patients fetched");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.getById(req.params.id, req.user!.organizationId);
      sendSuccess(res, patient, "Patient fetched");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.update(req.params.id, req.body, req.user!.organizationId);
      sendSuccess(res, patient, "Patient updated");
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
