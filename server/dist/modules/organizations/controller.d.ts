import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class OrganizationController {
    getAll(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    create(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    update(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const organizationController: OrganizationController;
//# sourceMappingURL=controller.d.ts.map