import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/routes";
import userRoutes from "./modules/users/routes";
import patientRoutes from "./modules/patients/routes";
import appointmentRoutes from "./modules/appointments/routes";
import consultationRoutes from "./modules/consultations/routes";
import pharmacyRoutes from "./modules/pharmacy/routes";
import notificationRoutes from "./modules/notifications/routes";
import statsRoutes from "./modules/stats/routes";

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/pharmacy", pharmacyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (userId: string) => {
    socket.join(`user:${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(errorHandler);

httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
