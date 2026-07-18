import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class InvoiceController {
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    recordPayment(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPayments(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    downloadPdf(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const invoiceController: InvoiceController;
//# sourceMappingURL=controller.d.ts.map