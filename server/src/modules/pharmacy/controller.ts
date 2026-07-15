import { Response, NextFunction } from "express";
import { pharmacyService } from "./service";
import { generatePrescriptionPdf } from "./pdf";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class PharmacyController {
  async getAllMedicines(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const medicines = await pharmacyService.getAllMedicines(search, req.user!.organizationId);
      sendSuccess(res, medicines, "Medicines fetched");
    } catch (error) {
      next(error);
    }
  }

  async createMedicine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medicine = await pharmacyService.createMedicine(req.body, req.user!.organizationId);
      sendCreated(res, medicine, "Medicine added");
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medicine = await pharmacyService.updateStock(req.params.id as string, req.body.stock, req.user!.organizationId);
      sendSuccess(res, medicine, "Stock updated");
    } catch (error) {
      next(error);
    }
  }

  async createSale(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await pharmacyService.createSale(req.body, req.user!.organizationId);
      sendCreated(res, sale, "Sale recorded");
    } catch (error) {
      next(error);
    }
  }

  async getSales(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sales = await pharmacyService.getSales(req.user!.organizationId);
      sendSuccess(res, sales, "Sales fetched");
    } catch (error) {
      next(error);
    }
  }

  async getPrescriptions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        patientId: req.query.patientId as string,
        doctorId: req.query.doctorId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
      };
      const prescriptions = await pharmacyService.getPrescriptions(filters, req.user!.organizationId);
      sendSuccess(res, prescriptions, "Prescriptions fetched");
    } catch (error) {
      next(error);
    }
  }

  async createPrescription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prescription = await pharmacyService.createPrescription(req.body, req.user!.organizationId);
      sendCreated(res, prescription, "Prescription created");
    } catch (error) {
      next(error);
    }
  }

  async downloadPrescriptionPdf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pdf = await generatePrescriptionPdf(req.params.id as string, req.user!.organizationId);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=prescription-${req.params.id}.pdf`);
      res.send(pdf);
    } catch (error) {
      next(error);
    }
  }

  async updateMedicine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medicine = await pharmacyService.updateMedicine(req.params.id as string, req.body, req.user!.organizationId);
      sendSuccess(res, medicine, "Medicine updated");
    } catch (error) {
      next(error);
    }
  }

  async getInventoryAlerts(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const alerts = await pharmacyService.getInventoryAlerts(req.user!.organizationId);
      sendSuccess(res, alerts, "Inventory alerts fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const pharmacyController = new PharmacyController();
