import { Response, NextFunction } from "express";
import { organizationService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class OrganizationController {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orgs = await organizationService.getAll();
      sendSuccess(res, orgs, "Organizations fetched");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.getById(req.params.id as string);
      sendSuccess(res, org, "Organization fetched");
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.create(req.body);
      sendCreated(res, org, "Organization created");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await organizationService.update(req.params.id as string, req.body);
      sendSuccess(res, org, "Organization updated");
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await organizationService.getStats(req.params.id as string);
      sendSuccess(res, stats, "Organization stats fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
