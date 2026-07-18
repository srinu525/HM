import { metrics } from "../services/metrics";
export function metricsMiddleware(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        metrics.recordRequest({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date(),
        });
        if (res.statusCode >= 500) {
            metrics.recordError(`${req.method} ${req.path} returned ${res.statusCode}`);
        }
    });
    next();
}
//# sourceMappingURL=metrics.js.map