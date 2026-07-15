import { Server } from "socket.io";
import { logger } from "./common/logger";
import type http from "http";

let io: Server;

export function initSocket(httpServer: http.Server, corsOrigin: string) {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.debug({ socketId: socket.id }, "Client connected");

    socket.on("join", (userId: string) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id }, "Client disconnected");
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}
