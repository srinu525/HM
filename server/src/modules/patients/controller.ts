import { Response, NextFunction } from "express";
import { patientService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated, sendPaginated } from "../../common/response";

export class PatientController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.create(req.body, req.user!.organizationId as string);
      sendCreated(res, patient, "Patient registered successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { patients, total } = await patientService.getAll(search, req.user!.organizationId as string, page, limit);
      sendPaginated(res, patients, total, page, limit, "Patients fetched");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.getById(req.params.id as string, req.user!.organizationId as string);
      sendSuccess(res, patient, "Patient fetched");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const patient = await patientService.update(req.params.id as string, req.body, req.user!.organizationId as string);
      sendSuccess(res, patient, "Patient updated");
    } catch (error) {
      next(error);
    }
  }
}

export const patientController = new PatientController();
