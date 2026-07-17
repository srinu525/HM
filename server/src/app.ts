import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { logger } from "./common/logger";
import { initSocket } from "./socket";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate, authorize } from "./middleware/auth";
import { tenantScope } from "./middleware/tenant";
import { requestId } from "./middleware/request-id";
import { metricsMiddleware } from "./middleware/metrics";
import { metrics } from "./services/metrics";
import { startCronJobs, stopCronJobs } from "./cron";
import swaggerOptions from "./config/swagger";
import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/users/routes";
import patientRoutes from "./modules/patients/routes";
import appointmentRoutes from "./modules/appointments/routes";
import consultationRoutes from "./modules/consultations/routes";
import pharmacyRoutes from "./modules/pharmacy/routes";
import notificationRoutes from "./modules/notifications/routes";
import organizationRoutes from "./modules/organizations/routes";
import planRoutes from "./modules/plans/routes";
import auditLogRoutes from "./modules/audit-logs/routes";
import fileRoutes from "./modules/files/routes";
import labRoutes from "./modules/lab/routes";
import invoiceRoutes from "./modules/invoices/routes";
import statsRoutes from "./modules/stats/routes";
import adminRoutes from "./modules/admin/routes";
import "./modules/notifications/events";

const app = express();
const httpServer = createServer(app);

initSocket(httpServer, env.CORS_ORIGIN);

app.use(requestId);
app.use(metricsMiddleware);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan("combined", {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
}));
app.use(express.json());

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "HM API Documentation",
  customCss: ".swagger-ui .topbar { display: none }",
}));
app.get("/api/docs.json", (_req, res) => {
  res.json(swaggerSpec);
});

app.get("/api/health", async (_req, res) => {
  const health = await metrics.getHealth();
  res.status(health.status === "unhealthy" ? 503 : 200).json(health);
});

app.get("/api/metrics", (_req, res) => {
  res.json(metrics.getStats());
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", authenticate, adminRoutes);
app.use("/api/v1/users", authenticate, tenantScope, userRoutes);
app.use("/api/v1/patients", authenticate, tenantScope, patientRoutes);
app.use("/api/v1/appointments", authenticate, tenantScope, appointmentRoutes);
app.use("/api/v1/consultations", authenticate, tenantScope, consultationRoutes);
app.use("/api/v1/pharmacy", authenticate, tenantScope, pharmacyRoutes);
app.use("/api/v1/notifications", authenticate, tenantScope, notificationRoutes);
app.use("/api/v1/organizations", authenticate, tenantScope, organizationRoutes);
app.use("/api/v1/billing", authenticate, tenantScope, planRoutes);
app.use("/api/v1/audit-logs", authenticate, tenantScope, auditLogRoutes);
app.use("/api/v1/files", authenticate, tenantScope, fileRoutes);
app.use("/api/v1/lab", authenticate, tenantScope, labRoutes);
app.use("/api/v1/invoices", authenticate, tenantScope, invoiceRoutes);
app.use("/api/v1/stats", authenticate, tenantScope, statsRoutes);

// Backward compatibility - old /api/ routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authenticate, tenantScope, userRoutes);
app.use("/api/patients", authenticate, tenantScope, patientRoutes);
app.use("/api/appointments", authenticate, tenantScope, appointmentRoutes);
app.use("/api/consultations", authenticate, tenantScope, consultationRoutes);
app.use("/api/pharmacy", authenticate, tenantScope, pharmacyRoutes);
app.use("/api/notifications", authenticate, tenantScope, notificationRoutes);
app.use("/api/stats", authenticate, tenantScope, statsRoutes);

app.use(errorHandler);

if (env.CRON_ENABLED) {
  startCronJobs();
}

const gracefulShutdown = () => {
  logger.info("Shutting down gracefully...");
  stopCronJobs();
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV, cron: env.CRON_ENABLED }, "Server running");
  logger.info({ url: `http://localhost:${env.PORT}/api/docs` }, "API docs available");
});

export default app;
