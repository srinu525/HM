import { labService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class LabController {
    async getTests(req, res, next) {
        try {
            const tests = await labService.getTests(req.user.organizationId);
            sendSuccess(res, tests, "Lab tests fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async createTest(req, res, next) {
        try {
            const test = await labService.createTest(req.body, req.user.organizationId);
            sendCreated(res, test, "Lab test created");
        }
        catch (error) {
            next(error);
        }
    }
    async updateTest(req, res, next) {
        try {
            const test = await labService.updateTest(req.params.id, req.body, req.user.organizationId);
            sendSuccess(res, test, "Lab test updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getResults(req, res, next) {
        try {
            const results = await labService.getResults(req.user.organizationId, {
                patientId: req.query.patientId,
                doctorId: req.query.doctorId,
                labTestId: req.query.labTestId,
                status: req.query.status,
            });
            sendSuccess(res, results, "Lab results fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async createResult(req, res, next) {
        try {
            const result = await labService.createResult({ ...req.body, doctorId: req.user.id }, req.user.organizationId);
            sendCreated(res, result, "Lab result created");
        }
        catch (error) {
            next(error);
        }
    }
    async updateResult(req, res, next) {
        try {
            const result = await labService.updateResult(req.params.id, req.body, req.user.organizationId);
            sendSuccess(res, result, "Lab result updated");
        }
        catch (error) {
            next(error);
        }
    }
}
export const labController = new LabController();
//# sourceMappingURL=controller.js.map