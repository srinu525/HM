import { pharmacyService } from "./service";
import { generatePrescriptionPdf } from "./pdf";
import { sendSuccess, sendCreated } from "../../common/response";
export class PharmacyController {
    async getAllMedicines(req, res, next) {
        try {
            const search = req.query.search;
            const medicines = await pharmacyService.getAllMedicines(search, req.user.organizationId);
            sendSuccess(res, medicines, "Medicines fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async createMedicine(req, res, next) {
        try {
            const medicine = await pharmacyService.createMedicine(req.body, req.user.organizationId);
            sendCreated(res, medicine, "Medicine added");
        }
        catch (error) {
            next(error);
        }
    }
    async updateStock(req, res, next) {
        try {
            const medicine = await pharmacyService.updateStock(req.params.id, req.body.stock, req.user.organizationId);
            sendSuccess(res, medicine, "Stock updated");
        }
        catch (error) {
            next(error);
        }
    }
    async createSale(req, res, next) {
        try {
            const sale = await pharmacyService.createSale(req.body, req.user.organizationId);
            sendCreated(res, sale, "Sale recorded");
        }
        catch (error) {
            next(error);
        }
    }
    async getSales(req, res, next) {
        try {
            const sales = await pharmacyService.getSales(req.user.organizationId);
            sendSuccess(res, sales, "Sales fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getPrescriptions(req, res, next) {
        try {
            const filters = {
                patientId: req.query.patientId,
                doctorId: req.query.doctorId,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const prescriptions = await pharmacyService.getPrescriptions(filters, req.user.organizationId);
            sendSuccess(res, prescriptions, "Prescriptions fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async createPrescription(req, res, next) {
        try {
            const prescription = await pharmacyService.createPrescription(req.body, req.user.organizationId);
            sendCreated(res, prescription, "Prescription created");
        }
        catch (error) {
            next(error);
        }
    }
    async downloadPrescriptionPdf(req, res, next) {
        try {
            const pdf = await generatePrescriptionPdf(req.params.id, req.user.organizationId);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=prescription-${req.params.id}.pdf`);
            res.send(pdf);
        }
        catch (error) {
            next(error);
        }
    }
    async updateMedicine(req, res, next) {
        try {
            const medicine = await pharmacyService.updateMedicine(req.params.id, req.body, req.user.organizationId);
            sendSuccess(res, medicine, "Medicine updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getInventoryAlerts(req, res, next) {
        try {
            const alerts = await pharmacyService.getInventoryAlerts(req.user.organizationId);
            sendSuccess(res, alerts, "Inventory alerts fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const pharmacyController = new PharmacyController();
//# sourceMappingURL=controller.js.map