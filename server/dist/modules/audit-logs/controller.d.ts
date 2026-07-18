import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class AuditLogController {
    getByOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const auditLogController: AuditLogController;
//# sourceMappingURL=controller.d.ts.map