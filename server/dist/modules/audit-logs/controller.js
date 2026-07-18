import { auditLogService } from "./service";
import { sendSuccess } from "../../common/response";
export class AuditLogController {
    async getByOrganization(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const filters = {
                entity: req.query.entity,
                action: req.query.action,
                userId: req.query.userId,
            };
            const result = await auditLogService.getByOrganization(req.user.organizationId, filters, page, limit);
            sendSuccess(res, result, "Audit logs fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const auditLogController = new AuditLogController();
//# sourceMappingURL=controller.js.map