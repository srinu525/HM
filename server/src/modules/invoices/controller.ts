import { Response, NextFunction } from "express";
import { invoiceService } from "./service";
import { generateInvoicePdf } from "./pdf";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class InvoiceController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoices = await invoiceService.getAll(req.user!.organizationId, {
        status: req.query.status as string,
        patientId: req.query.patientId as string,
      });
      sendSuccess(res, invoices, "Invoices fetched");
    } catch (error) { next(error); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.getById(req.params.id as string, req.user!.organizationId);
      sendSuccess(res, invoice, "Invoice fetched");
    } catch (error) { next(error); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.create(req.body, req.user!.organizationId);
      sendCreated(res, invoice, "Invoice created");
    } catch (error) { next(error); }
  }

  async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoice = await invoiceService.updateStatus(req.params.id as string, req.body.status, req.user!.organizationId);
      sendSuccess(res, invoice, "Invoice updated");
    } catch (error) { next(error); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await invoiceService.delete(req.params.id as string, req.user!.organizationId);
      sendSuccess(res, null, "Invoice deleted");
    } catch (error) { next(error); }
  }

  async recordPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await invoiceService.recordPayment(req.body, req.user!.organizationId);
      sendCreated(res, payment, "Payment recorded");
    } catch (error) { next(error); }
  }

  async getPayments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payments = await invoiceService.getPayments(req.user!.organizationId, {
        patientId: req.query.patientId as string,
        method: req.query.method as string,
      });
      sendSuccess(res, payments, "Payments fetched");
    } catch (error) { next(error); }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await invoiceService.getStats(req.user!.organizationId);
      sendSuccess(res, stats, "Invoice stats fetched");
    } catch (error) { next(error); }
  }

  async downloadPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pdf = await generateInvoicePdf(req.params.id as string, req.user!.organizationId);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=invoice-${req.params.id}.pdf`);
      res.send(pdf);
    } catch (error) { next(error); }
  }
}

export const invoiceController = new InvoiceController();
