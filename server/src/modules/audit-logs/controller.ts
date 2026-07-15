import { Response, NextFunction } from "express";
import { auditLogService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";

export class AuditLogController {
  async getByOrganization(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const filters = {
        entity: req.query.entity as string,
        action: req.query.action as string,
        userId: req.query.userId as string,
      };
      const result = await auditLogService.getByOrganization(req.user!.organizationId, filters, page, limit);
      sendSuccess(res, result, "Audit logs fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const auditLogController = new AuditLogController();
