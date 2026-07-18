import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class PlanController {
    getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    subscribe(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOrgSubscription(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    cancel(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const planController: PlanController;
//# sourceMappingURL=controller.d.ts.map