import { Response, NextFunction } from "express";
import { consultationService } from "./service";
import { generateCertificatePdf } from "./pdf";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class ConsultationController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultation = await consultationService.create({
        ...req.body,
        doctorId: req.user!.id,
      });
      sendCreated(res, consultation, "Consultation created");
    } catch (error) {
      next(error);
    }
  }

  async getByDoctor(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultations = await consultationService.getByDoctor(req.user!.id);
      sendSuccess(res, consultations, "Consultations fetched");
    } catch (error) {
      next(error);
    }
  }

  async getByPatient(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultations = await consultationService.getByPatient(req.params.patientId as string);
      sendSuccess(res, consultations, "Patient consultations fetched");
    } catch (error) {
      next(error);
    }
  }

  async getTodayCompleted(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const consultations = await consultationService.getTodayCompletedByDoctor(req.user!.id);
      sendSuccess(res, consultations, "Today's completed consultations fetched");
    } catch (error) {
      next(error);
    }
  }

  async downloadCertificate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const type = (req.query.type as "sick" | "fitness") || "sick";
      const days = req.query.days ? parseInt(req.query.days as string, 10) : undefined;
      const pdf = await generateCertificatePdf(
        req.params.consultationId as string,
        req.user!.organizationId as string,
        { type, days }
      );
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${type}-certificate-${req.params.consultationId}.pdf`);
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }
}

export const consultationController = new ConsultationController();
