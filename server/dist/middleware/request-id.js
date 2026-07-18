import { randomUUID } from "crypto";
export function requestId(req, _res, next) {
    req.requestId = req.headers["x-request-id"] || randomUUID();
    next();
}
//# sourceMappingURL=request-id.js.map