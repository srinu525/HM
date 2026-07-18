import { appointmentService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class AppointmentController {
    async create(req, res, next) {
        try {
            const appointment = await appointmentService.create(req.body, req.user.organizationId);
            sendCreated(res, appointment, "Appointment booked");
        }
        catch (error) {
            next(error);
        }
    }
    async getByDoctor(req, res, next) {
        try {
            const appointments = await appointmentService.getByDoctor(req.params.doctorId, req.user.organizationId);
            sendSuccess(res, appointments, "Appointments fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const appointment = await appointmentService.updateStatus(req.params.id, req.body.status, req.user.organizationId);
            sendSuccess(res, appointment, "Status updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getQueue(req, res, next) {
        try {
            const queue = await appointmentService.getQueue(req.params.doctorId, req.user.organizationId);
            sendSuccess(res, queue, "Queue fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getTodayAll(req, res, next) {
        try {
            const appointments = await appointmentService.getTodayAll(req.user.organizationId);
            sendSuccess(res, appointments, "Today's appointments fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const appointmentController = new AppointmentController();
//# sourceMappingURL=controller.js.map