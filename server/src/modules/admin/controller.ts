import { Response, NextFunction } from "express";
import { adminService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class AdminController {
  async getPlatformStats(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getPlatformStats();
      sendSuccess(res, stats, "Platform stats fetched");
    } catch (error) { next(error); }
  }

  async getAllOrganizations(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orgs = await adminService.getAllOrganizations();
      sendSuccess(res, orgs, "Organizations fetched");
    } catch (error) { next(error); }
  }

  async getOrganizationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await adminService.getOrganizationById(req.params.id as string);
      sendSuccess(res, org, "Organization fetched");
    } catch (error) { next(error); }
  }

  async createOrganization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await adminService.createOrganization(req.body);
      sendCreated(res, org, "Organization created");
    } catch (error) { next(error); }
  }

  async updateOrganization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await adminService.updateOrganization(req.params.id as string, req.body);
      sendSuccess(res, org, "Organization updated");
    } catch (error) { next(error); }
  }

  async deleteOrganization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const org = await adminService.deleteOrganization(req.params.id as string);
      sendSuccess(res, org, "Organization deactivated");
    } catch (error) { next(error); }
  }

  async getAllUsers(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await adminService.getAllUsers();
      sendSuccess(res, users, "Users fetched");
    } catch (error) { next(error); }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await adminService.updateUser(req.params.id as string, req.body);
      sendSuccess(res, user, "User updated");
    } catch (error) { next(error); }
  }

  async getRevenueByOrg(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const revenue = await adminService.getRevenueByOrg();
      sendSuccess(res, revenue, "Revenue by org fetched");
    } catch (error) { next(error); }
  }

  async getSystemAuditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId, entity, action, page, limit } = req.query;
      const result = await adminService.getSystemAuditLogs({
        organizationId: organizationId as string,
        entity: entity as string,
        action: action as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      sendSuccess(res, result, "System audit logs fetched");
    } catch (error) { next(error); }
  }

  async getFeatureFlags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const flags = await adminService.getFeatureFlags(req.params.orgId as string);
      sendSuccess(res, flags, "Feature flags fetched");
    } catch (error) { next(error); }
  }

  async setFeatureFlag(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orgId } = req.params;
      const { key, isEnabled, name, description } = req.body;
      const flag = await adminService.setFeatureFlag(orgId as string, key, isEnabled, name, description);
      sendSuccess(res, flag, "Feature flag updated");
    } catch (error) { next(error); }
  }

  async bulkSetFeatureFlags(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orgId } = req.params;
      const { flags } = req.body;
      const result = await adminService.bulkSetFeatureFlags(orgId as string, flags);
      sendSuccess(res, result, "Feature flags updated");
    } catch (error) { next(error); }
  }

  async getPlatformSettings(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await adminService.getPlatformSettings();
      sendSuccess(res, settings, "Platform settings fetched");
    } catch (error) { next(error); }
  }

  async setPlatformSetting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, value, category } = req.body;
      const setting = await adminService.setPlatformSetting(key, value, category);
      sendSuccess(res, setting, "Platform setting updated");
    } catch (error) { next(error); }
  }
}

export const adminController = new AdminController();
