import { statsService } from "./service";
import { sendSuccess } from "../../common/response";
export class StatsController {
    async getBasicStats(req, res, next) {
        try {
            const stats = await statsService.getBasicStats(req.user.organizationId);
            sendSuccess(res, stats, "Stats fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getSystemStats(_req, res, next) {
        try {
            const stats = await statsService.getSystemStats();
            sendSuccess(res, stats, "System stats fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getSystemAnalytics(_req, res, next) {
        try {
            const analytics = await statsService.getSystemAnalytics();
            sendSuccess(res, analytics, "System analytics fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getAnalytics(req, res, next) {
        try {
            const analytics = await statsService.getAnalytics(req.user.organizationId);
            sendSuccess(res, analytics, "Analytics fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getAppointmentHistory(req, res, next) {
        try {
            const { doctorId, patientId, startDate, endDate } = req.query;
            const filters = {};
            if (doctorId)
                filters.doctorId = doctorId;
            if (patientId)
                filters.patientId = patientId;
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            const history = await statsService.getAppointmentHistory(filters, req.user.organizationId);
            sendSuccess(res, history, "Appointment history fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getSalesHistory(req, res, next) {
        try {
            const { startDate, endDate } = req.query;
            const filters = {};
            if (startDate)
                filters.startDate = new Date(startDate);
            if (endDate)
                filters.endDate = new Date(endDate);
            const history = await statsService.getSalesHistory(filters, req.user.organizationId);
            sendSuccess(res, history, "Sales history fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const statsController = new StatsController();
//# sourceMappingURL=controller.js.map