interface RequestMetric {
    method: string;
    path: string;
    statusCode: number;
    duration: number;
    timestamp: Date;
}
interface HealthStatus {
    status: "healthy" | "degraded" | "unhealthy";
    uptime: number;
    timestamp: string;
    services: {
        database: "up" | "down";
        memory: {
            used: number;
            total: number;
            percentage: number;
        };
    };
    version: string;
}
declare class Metrics {
    private requests;
    private errors;
    private readonly startTime;
    private readonly MAX_REQUESTS;
    private readonly MAX_ERRORS;
    recordRequest(metric: RequestMetric): void;
    recordError(message: string, stack?: string): void;
    getStats(): {
        totalRequests: number;
        recent5m: {
            count: number;
            avgDuration: number;
            errorRate: number;
        };
        recent1h: {
            count: number;
            avgDuration: number;
            errorRate: number;
        };
        recentErrors: {
            message: string;
            stack?: string;
            timestamp: Date;
        }[];
        uptime: number;
    };
    getHealth(): Promise<HealthStatus>;
}
export declare const metrics: Metrics;
export {};
//# sourceMappingURL=metrics.d.ts.map