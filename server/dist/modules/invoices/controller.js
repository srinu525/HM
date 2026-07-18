import { invoiceService } from "./service";
import { generateInvoicePdf } from "./pdf";
import { sendSuccess, sendCreated } from "../../common/response";
export class InvoiceController {
    async getAll(req, res, next) {
        try {
            const invoices = await invoiceService.getAll(req.user.organizationId, {
                status: req.query.status,
                patientId: req.query.patientId,
            });
            sendSuccess(res, invoices, "Invoices fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const invoice = await invoiceService.getById(req.params.id, req.user.organizationId);
            sendSuccess(res, invoice, "Invoice fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async create(req, res, next) {
        try {
            const invoice = await invoiceService.create(req.body, req.user.organizationId);
            sendCreated(res, invoice, "Invoice created");
        }
        catch (error) {
            next(error);
        }
    }
    async updateStatus(req, res, next) {
        try {
            const invoice = await invoiceService.updateStatus(req.params.id, req.body.status, req.user.organizationId);
            sendSuccess(res, invoice, "Invoice updated");
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            await invoiceService.delete(req.params.id, req.user.organizationId);
            sendSuccess(res, null, "Invoice deleted");
        }
        catch (error) {
            next(error);
        }
    }
    async recordPayment(req, res, next) {
        try {
            const payment = await invoiceService.recordPayment(req.body, req.user.organizationId);
            sendCreated(res, payment, "Payment recorded");
        }
        catch (error) {
            next(error);
        }
    }
    async getPayments(req, res, next) {
        try {
            const payments = await invoiceService.getPayments(req.user.organizationId, {
                patientId: req.query.patientId,
                method: req.query.method,
            });
            sendSuccess(res, payments, "Payments fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getStats(req, res, next) {
        try {
            const stats = await invoiceService.getStats(req.user.organizationId);
            sendSuccess(res, stats, "Invoice stats fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async downloadPdf(req, res, next) {
        try {
            const pdf = await generateInvoicePdf(req.params.id, req.user.organizationId);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=invoice-${req.params.id}.pdf`);
            res.send(pdf);
        }
        catch (error) {
            next(error);
        }
    }
}
export const invoiceController = new InvoiceController();
//# sourceMappingURL=controller.js.map