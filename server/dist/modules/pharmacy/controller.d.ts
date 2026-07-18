import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class PharmacyController {
    getAllMedicines(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createMedicine(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStock(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createSale(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSales(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPrescriptions(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createPrescription(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    downloadPrescriptionPdf(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateMedicine(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getInventoryAlerts(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const pharmacyController: PharmacyController;
//# sourceMappingURL=controller.d.ts.map