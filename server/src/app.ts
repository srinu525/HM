import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { env } from "./config/env";
import { logger } from "./common/logger";
import { initSocket } from "./socket";
import { errorHandler } from "./middleware/errorHandler";
import { authenticate, authorize } from "./middleware/auth";
import { tenantScope } from "./middleware/tenant";
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

const app = express();
const httpServer = createServer(app);

initSocket(httpServer, env.CORS_ORIGIN);

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(morgan("combined", {
  stream: { write: (msg: string) => logger.info(msg.trim()) },
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/v1/auth", authRoutes);
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

httpServer.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "Server running");
});

export default app;
