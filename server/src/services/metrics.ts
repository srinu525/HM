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
    memory: { used: number; total: number; percentage: number };
  };
  version: string;
}

class Metrics {
  private requests: RequestMetric[] = [];
  private errors: { message: string; stack?: string; timestamp: Date }[] = [];
  private readonly startTime = Date.now();
  private readonly MAX_REQUESTS = 1000;
  private readonly MAX_ERRORS = 100;

  recordRequest(metric: RequestMetric) {
    this.requests.push(metric);
    if (this.requests.length > this.MAX_REQUESTS) {
      this.requests = this.requests.slice(-this.MAX_REQUESTS);
    }
  }

  recordError(message: string, stack?: string) {
    this.errors.push({ message, stack, timestamp: new Date() });
    if (this.errors.length > this.MAX_ERRORS) {
      this.errors = this.errors.slice(-this.MAX_ERRORS);
    }
  }

  getStats() {
    const now = Date.now();
    const last5m = this.requests.filter((r) => now - r.timestamp.getTime() < 5 * 60 * 1000);
    const last1h = this.requests.filter((r) => now - r.timestamp.getTime() < 60 * 60 * 1000);

    return {
      totalRequests: this.requests.length,
      recent5m: {
        count: last5m.length,
        avgDuration: last5m.length > 0 ? last5m.reduce((sum, r) => sum + r.duration, 0) / last5m.length : 0,
        errorRate: last5m.length > 0 ? (last5m.filter((r) => r.statusCode >= 400).length / last5m.length) * 100 : 0,
      },
      recent1h: {
        count: last1h.length,
        avgDuration: last1h.length > 0 ? last1h.reduce((sum, r) => sum + r.duration, 0) / last1h.length : 0,
        errorRate: last1h.length > 0 ? (last1h.filter((r) => r.statusCode >= 400).length / last1h.length) * 100 : 0,
      },
      recentErrors: this.errors.slice(-10),
      uptime: (now - this.startTime) / 1000,
    };
  }

  async getHealth(): Promise<HealthStatus> {
    let dbStatus: "up" | "down" = "up";
    try {
      const { prisma } = await import("../utils/prisma");
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "down";
    }

    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal;
    const usedMem = memUsage.heapUsed;

    const status = dbStatus === "down" ? "unhealthy" : "healthy";

    return {
      status,
      uptime: (Date.now() - this.startTime) / 1000,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        memory: {
          used: Math.round(usedMem / 1024 / 1024),
          total: Math.round(totalMem / 1024 / 1024),
          percentage: Math.round((usedMem / totalMem) * 100),
        },
      },
      version: process.env.npm_package_version || "1.0.0",
    };
  }
}

export const metrics = new Metrics();
