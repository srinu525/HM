import { logger } from "../common/logger";
import { env } from "../config/env";
export const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (statusCode >= 500) {
        logger.error({ err, method: req.method, url: req.url }, "Server error");
    }
    else {
        logger.warn({ method: req.method, url: req.url, statusCode, message }, "Client error");
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(env.isDevelopment && { stack: err.stack }),
    });
};
//# sourceMappingURL=errorHandler.js.map