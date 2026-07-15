import { Response, NextFunction } from "express";
import { labService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class LabController {
  async getTests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tests = await labService.getTests(req.user!.organizationId);
      sendSuccess(res, tests, "Lab tests fetched");
    } catch (error) { next(error); }
  }

  async createTest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const test = await labService.createTest(req.body, req.user!.organizationId);
      sendCreated(res, test, "Lab test created");
    } catch (error) { next(error); }
  }

  async updateTest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const test = await labService.updateTest(req.params.id as string, req.body, req.user!.organizationId);
      sendSuccess(res, test, "Lab test updated");
    } catch (error) { next(error); }
  }

  async getResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const results = await labService.getResults(req.user!.organizationId, {
        patientId: req.query.patientId as string,
        doctorId: req.query.doctorId as string,
        labTestId: req.query.labTestId as string,
        status: req.query.status as string,
      });
      sendSuccess(res, results, "Lab results fetched");
    } catch (error) { next(error); }
  }

  async createResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await labService.createResult({ ...req.body, doctorId: req.user!.id }, req.user!.organizationId);
      sendCreated(res, result, "Lab result created");
    } catch (error) { next(error); }
  }

  async updateResult(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await labService.updateResult(req.params.id as string, req.body, req.user!.organizationId);
      sendSuccess(res, result, "Lab result updated");
    } catch (error) { next(error); }
  }
}

export const labController = new LabController();
