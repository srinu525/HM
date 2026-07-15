import { Response, NextFunction } from "express";
import { planService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class PlanController {
  async getAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plans = await planService.getAll();
      sendSuccess(res, plans, "Plans fetched");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await planService.getById(req.params.id as string);
      sendSuccess(res, plan, "Plan fetched");
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await planService.create(req.body);
      sendCreated(res, plan, "Plan created");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const plan = await planService.update(req.params.id as string, req.body);
      sendSuccess(res, plan, "Plan updated");
    } catch (error) {
      next(error);
    }
  }

  async subscribe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.subscribe(req.user!.organizationId, req.body.planId, req.body.months);
      sendCreated(res, sub, "Subscribed successfully");
    } catch (error) {
      next(error);
    }
  }

  async getOrgSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.getOrgSubscription(req.user!.organizationId);
      sendSuccess(res, sub, "Subscription fetched");
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.cancel(req.params.id as string, req.user!.organizationId);
      sendSuccess(res, sub, "Subscription cancelled");
    } catch (error) {
      next(error);
    }
  }
}

export const planController = new PlanController();
