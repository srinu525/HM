import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class StatsController {
    getBasicStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSystemStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSystemAnalytics(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAnalytics(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAppointmentHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getSalesHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const statsController: StatsController;
//# sourceMappingURL=controller.d.ts.map