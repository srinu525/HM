import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { auditLogService } from "../modules/audit-logs/service";

export function auditLog(entity: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);
    const statusCode = res.statusCode;

    res.json = function (body: unknown) {
      if (statusCode >= 200 && statusCode < 300 && req.user) {
        const action = req.method === "POST" ? "CREATE" :
                       req.method === "PUT" || req.method === "PATCH" ? "UPDATE" :
                       req.method === "DELETE" ? "DELETE" : null;

        if (action) {
          const data = body as { data?: { id?: string } };
          auditLogService.log({
            action,
            entity,
            entityId: req.params.id as string || data?.data?.id,
            newValue: req.body,
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
            organizationId: req.user.organizationId as string,
            userId: req.user.id,
          }).catch(() => {});
        }
      }
      return originalJson(body);
    };

    next();
  };
}
