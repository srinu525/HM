import { auditLogService } from "../modules/audit-logs/service";
export function auditLog(entity) {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);
        const statusCode = res.statusCode;
        res.json = function (body) {
            if (statusCode >= 200 && statusCode < 300 && req.user) {
                const action = req.method === "POST" ? "CREATE" :
                    req.method === "PUT" || req.method === "PATCH" ? "UPDATE" :
                        req.method === "DELETE" ? "DELETE" : null;
                if (action) {
                    const data = body;
                    auditLogService.log({
                        action,
                        entity,
                        entityId: req.params.id || data?.data?.id,
                        newValue: req.body,
                        ipAddress: req.ip,
                        userAgent: req.get("User-Agent"),
                        organizationId: req.user.organizationId,
                        userId: req.user.id,
                    }).catch(() => { });
                }
            }
            return originalJson(body);
        };
        next();
    };
}
//# sourceMappingURL=audit.js.map