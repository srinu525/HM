import { planService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class PlanController {
    async getAll(_req, res, next) {
        try {
            const plans = await planService.getAll();
            sendSuccess(res, plans, "Plans fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const plan = await planService.getById(req.params.id);
            sendSuccess(res, plan, "Plan fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const plan = await planService.create(req.body);
            sendCreated(res, plan, "Plan created");
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const plan = await planService.update(req.params.id, req.body);
            sendSuccess(res, plan, "Plan updated");
        }
        catch (error) {
            next(error);
        }
    }
    async subscribe(req, res, next) {
        try {
            const sub = await planService.subscribe(req.user.organizationId, req.body.planId, req.body.months);
            sendCreated(res, sub, "Subscribed successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async getOrgSubscription(req, res, next) {
        try {
            const sub = await planService.getOrgSubscription(req.user.organizationId);
            sendSuccess(res, sub, "Subscription fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async cancel(req, res, next) {
        try {
            const sub = await planService.cancel(req.params.id, req.user.organizationId);
            sendSuccess(res, sub, "Subscription cancelled");
        }
        catch (error) {
            next(error);
        }
    }
}
export const planController = new PlanController();
//# sourceMappingURL=controller.js.map