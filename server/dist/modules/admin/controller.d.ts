import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class AdminController {
    getPlatformStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllOrganizations(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getOrganizationById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getAllUsers(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getRevenueByOrg(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getFeatureFlags(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    setFeatureFlag(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getPlatformSettings(_req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    setPlatformSetting(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const adminController: AdminController;
//# sourceMappingURL=controller.d.ts.map