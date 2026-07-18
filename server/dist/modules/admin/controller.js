import { adminService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class AdminController {
    async getPlatformStats(_req, res, next) {
        try {
            const stats = await adminService.getPlatformStats();
            sendSuccess(res, stats, "Platform stats fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getAllOrganizations(_req, res, next) {
        try {
            const orgs = await adminService.getAllOrganizations();
            sendSuccess(res, orgs, "Organizations fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getOrganizationById(req, res, next) {
        try {
            const org = await adminService.getOrganizationById(req.params.id);
            sendSuccess(res, org, "Organization fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async createOrganization(req, res, next) {
        try {
            const org = await adminService.createOrganization(req.body);
            sendCreated(res, org, "Organization created");
        }
        catch (error) {
            next(error);
        }
    }
    async updateOrganization(req, res, next) {
        try {
            const org = await adminService.updateOrganization(req.params.id, req.body);
            sendSuccess(res, org, "Organization updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(_req, res, next) {
        try {
            const users = await adminService.getAllUsers();
            sendSuccess(res, users, "Users fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const user = await adminService.updateUser(req.params.id, req.body);
            sendSuccess(res, user, "User updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getRevenueByOrg(_req, res, next) {
        try {
            const revenue = await adminService.getRevenueByOrg();
            sendSuccess(res, revenue, "Revenue by org fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getFeatureFlags(req, res, next) {
        try {
            const flags = await adminService.getFeatureFlags(req.params.orgId);
            sendSuccess(res, flags, "Feature flags fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async setFeatureFlag(req, res, next) {
        try {
            const { orgId } = req.params;
            const { key, isEnabled } = req.body;
            const flag = await adminService.setFeatureFlag(orgId, key, isEnabled);
            sendSuccess(res, flag, "Feature flag updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getPlatformSettings(_req, res, next) {
        try {
            const settings = await adminService.getPlatformSettings();
            sendSuccess(res, settings, "Platform settings fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async setPlatformSetting(req, res, next) {
        try {
            const { key, value, category } = req.body;
            const setting = await adminService.setPlatformSetting(key, value, category);
            sendSuccess(res, setting, "Platform setting updated");
        }
        catch (error) {
            next(error);
        }
    }
}
export const adminController = new AdminController();
//# sourceMappingURL=controller.js.map