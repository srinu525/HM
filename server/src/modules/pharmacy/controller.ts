import { Response, NextFunction } from "express";
import { pharmacyService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class PharmacyController {
  async getAllMedicines(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const medicines = await pharmacyService.getAllMedicines(search);
      res.json(medicines);
    } catch (error) {
      next(error);
    }
  }

  async createMedicine(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medicine = await pharmacyService.createMedicine(req.body);
      res.status(201).json(medicine);
    } catch (error) {
      next(error);
    }
  }

  async updateStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const medicine = await pharmacyService.updateStock(req.params.id as string, req.body.stock);
      res.json(medicine);
    } catch (error) {
      next(error);
    }
  }

  async createSale(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sale = await pharmacyService.createSale(req.body);
      res.status(201).json(sale);
    } catch (error) {
      next(error);
    }
  }

  async getSales(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sales = await pharmacyService.getSales();
      res.json(sales);
    } catch (error) {
      next(error);
    }
  }

  async createPrescription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const prescription = await pharmacyService.createPrescription(req.body);
      res.status(201).json(prescription);
    } catch (error) {
      next(error);
    }
  }
}

export const pharmacyController = new PharmacyController();
