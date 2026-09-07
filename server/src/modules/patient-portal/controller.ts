import { Response, NextFunction } from "express";
import { patientPortalService } from "./service";
import { generateInvoicePdf } from "../invoices/pdf";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class PatientPortalController {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await patientPortalService.login(req.body.email, req.body.password, req.body.organizationSlug);
      sendSuccess(res, result, "Login successful");
    } catch (error) { next(error); }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await patientPortalService.getProfile(req.user!.id);
      sendSuccess(res, profile, "Profile fetched");
    } catch (error) { next(error); }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await patientPortalService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, profile, "Profile updated");
    } catch (error) { next(error); }
  }

  async getAppointments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointments = await patientPortalService.getAppointments(req.user!.id);
      sendSuccess(res, appointments, "Appointments fetched");
    } catch (error) { next(error); }
  }

  async bookAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await patientPortalService.bookAppointment(req.body, req.user!.id);
      sendCreated(res, appointment, "Appointment booked");
    } catch (error) { next(error); }
  }

  async getPrescriptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prescriptions = await patientPortalService.getPrescriptions(req.user!.id);
      sendSuccess(res, prescriptions, "Prescriptions fetched");
    } catch (error) { next(error); }
  }

  async getLabResults(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const results = await patientPortalService.getLabResults(req.user!.id);
      sendSuccess(res, results, "Lab results fetched");
    } catch (error) { next(error); }
  }

  async getInvoices(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const invoices = await patientPortalService.getInvoices(req.user!.id, req.user!.organizationId as string);
      sendSuccess(res, invoices, "Invoices fetched");
    } catch (error) { next(error); }
  }

  async downloadInvoicePdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pdf = await generateInvoicePdf(req.params.id as string, req.user!.organizationId as string);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=invoice-${req.params.id as string}.pdf`);
      res.send(pdf);
    } catch (error) { next(error); }
  }

  async payInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const payment = await patientPortalService.payInvoice(req.params.id as string, req.user!.id, req.user!.organizationId as string);
      sendSuccess(res, payment, "Payment successful");
    } catch (error) { next(error); }
  }

  async cancelAppointment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const appointment = await patientPortalService.cancelAppointment(
        req.params.id as string,
        req.user!.id
      );
      sendSuccess(res, appointment, "Appointment cancelled");
    } catch (error) { next(error); }
  }

  async getDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctors = await patientPortalService.getDoctors?.(req.user!.organizationId as string);
      sendSuccess(res, doctors || [], "Doctors fetched");
    } catch (error) { next(error); }
  }
}

export const patientPortalController = new PatientPortalController();
