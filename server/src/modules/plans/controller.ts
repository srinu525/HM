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
      const sub = await planService.subscribe(
        req.user!.organizationId as string,
        req.body.planId,
        req.body.months,
        req.body.cycle,
      );
      sendCreated(res, sub, "Subscribed successfully");
    } catch (error) {
      next(error);
    }
  }

  async getAllSubscriptions(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const subs = await planService.getAllSubscriptions();
      sendSuccess(res, subs, "All subscriptions fetched");
    } catch (error) {
      next(error);
    }
  }

  async forceAssign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.forceAssign(
        req.params.orgId as string,
        req.body.planId,
        req.body.months,
        req.body.note,
      );
      sendSuccess(res, sub, "Plan assigned");
    } catch (error) {
      next(error);
    }
  }

  async forceCancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.forceCancel(req.params.orgId as string, req.body.note);
      sendSuccess(res, sub, "Subscription cancelled");
    } catch (error) {
      next(error);
    }
  }

  async getOrgSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.getOrgSubscription(req.user!.organizationId as string);
      sendSuccess(res, sub, "Subscription fetched");
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sub = await planService.cancel(req.params.id as string, req.user!.organizationId as string);
      sendSuccess(res, sub, "Subscription cancelled");
    } catch (error) {
      next(error);
    }
  }

  async getAddons(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addons = await planService.getAddons();
      sendSuccess(res, addons, "Add-ons fetched");
    } catch (error) {
      next(error);
    }
  }

  async createAddon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addon = await planService.createAddon(req.body);
      sendCreated(res, addon, "Add-on created");
    } catch (error) {
      next(error);
    }
  }

  async updateAddon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addon = await planService.updateAddon(req.params.id as string, req.body);
      sendSuccess(res, addon, "Add-on updated");
    } catch (error) {
      next(error);
    }
  }

  async deleteAddon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addon = await planService.deleteAddon(req.params.id as string);
      sendSuccess(res, addon, "Add-on deleted");
    } catch (error) {
      next(error);
    }
  }

  async getOrgAddons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addons = await planService.getOrgAddons(req.user!.organizationId as string);
      sendSuccess(res, addons, "Organization add-ons fetched");
    } catch (error) {
      next(error);
    }
  }

  async addOrgAddon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addon = await planService.addOrgAddon(req.user!.organizationId as string, req.body.addonId);
      sendCreated(res, addon, "Add-on added");
    } catch (error) {
      next(error);
    }
  }

  async removeOrgAddon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const addon = await planService.removeOrgAddon(req.user!.organizationId as string, req.params.addonId as string);
      sendSuccess(res, addon, "Add-on removed");
    } catch (error) {
      next(error);
    }
  }
}

export const planController = new PlanController();
