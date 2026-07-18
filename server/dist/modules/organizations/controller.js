import { organizationService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class OrganizationController {
    async getAll(_req, res, next) {
        try {
            const orgs = await organizationService.getAll();
            sendSuccess(res, orgs, "Organizations fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const org = await organizationService.getById(req.params.id);
            sendSuccess(res, org, "Organization fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const org = await organizationService.create(req.body);
            sendCreated(res, org, "Organization created");
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const org = await organizationService.update(req.params.id, req.body);
            sendSuccess(res, org, "Organization updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getStats(req, res, next) {
        try {
            const stats = await organizationService.getStats(req.params.id);
            sendSuccess(res, stats, "Organization stats fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const organizationController = new OrganizationController();
//# sourceMappingURL=controller.js.map