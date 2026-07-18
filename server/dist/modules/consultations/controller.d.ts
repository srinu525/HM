import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class ConsultationController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getByDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getByPatient(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTodayCompleted(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const consultationController: ConsultationController;
//# sourceMappingURL=controller.d.ts.map