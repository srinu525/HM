import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class PatientController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const patientController: PatientController;
//# sourceMappingURL=controller.d.ts.map