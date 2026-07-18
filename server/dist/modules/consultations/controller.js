import { consultationService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class ConsultationController {
    async create(req, res, next) {
        try {
            const consultation = await consultationService.create({
                ...req.body,
                doctorId: req.user.id,
            });
            sendCreated(res, consultation, "Consultation created");
        }
        catch (error) {
            next(error);
        }
    }
    async getByDoctor(req, res, next) {
        try {
            const consultations = await consultationService.getByDoctor(req.user.id);
            sendSuccess(res, consultations, "Consultations fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getByPatient(req, res, next) {
        try {
            const consultations = await consultationService.getByPatient(req.params.patientId);
            sendSuccess(res, consultations, "Patient consultations fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getTodayCompleted(req, res, next) {
        try {
            const consultations = await consultationService.getTodayCompletedByDoctor(req.user.id);
            sendSuccess(res, consultations, "Today's completed consultations fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const consultationController = new ConsultationController();
//# sourceMappingURL=controller.js.map