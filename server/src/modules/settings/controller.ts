import { Response, NextFunction } from "express";
import { orgSettingService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";

export class OrgSettingController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = req.query.category as string | undefined;
      const settings = await orgSettingService.getAll(req.user!.organizationId as string, category);
      sendSuccess(res, settings, "Settings fetched");
    } catch (error) {
      next(error);
    }
  }

  async getByKey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const setting = await orgSettingService.getByKey(req.params.key as string, req.user!.organizationId as string);
      sendSuccess(res, setting, "Setting fetched");
    } catch (error) {
      next(error);
    }
  }

  async upsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, value, category } = req.body;
      const setting = await orgSettingService.upsert(key, value, category, req.user!.organizationId as string);
      sendSuccess(res, setting, "Setting saved");
    } catch (error) {
      next(error);
    }
  }

  async bulkUpsert(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      const results = await orgSettingService.bulkUpsert(settings, req.user!.organizationId as string);
      sendSuccess(res, results, "Settings saved");
    } catch (error) {
      next(error);
    }
  }
}

export const orgSettingController = new OrgSettingController();
