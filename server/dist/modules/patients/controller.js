import { patientService } from "./service";
import { sendSuccess, sendCreated, sendPaginated } from "../../common/response";
export class PatientController {
    async create(req, res, next) {
        try {
            const patient = await patientService.create(req.body, req.user.organizationId);
            sendCreated(res, patient, "Patient registered successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const search = req.query.search;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const { patients, total } = await patientService.getAll(search, req.user.organizationId, page, limit);
            sendPaginated(res, patients, total, page, limit, "Patients fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const patient = await patientService.getById(req.params.id, req.user.organizationId);
            sendSuccess(res, patient, "Patient fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const patient = await patientService.update(req.params.id, req.body, req.user.organizationId);
            sendSuccess(res, patient, "Patient updated");
        }
        catch (error) {
            next(error);
        }
    }
}
export const patientController = new PatientController();
//# sourceMappingURL=controller.js.map