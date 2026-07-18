import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class AppointmentController {
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getByDoctor(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getQueue(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getTodayAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const appointmentController: AppointmentController;
//# sourceMappingURL=controller.d.ts.map