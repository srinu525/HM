import { Server } from "socket.io";
import { logger } from "./common/logger";
let io;
export function initSocket(httpServer, corsOrigin) {
    io = new Server(httpServer, {
        cors: {
            origin: corsOrigin,
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        logger.debug({ socketId: socket.id }, "Client connected");
        socket.on("join", (userId) => {
            socket.join(`user:${userId}`);
        });
        socket.on("disconnect", () => {
            logger.debug({ socketId: socket.id }, "Client disconnected");
        });
    });
    return io;
}
export function getIO() {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}
//# sourceMappingURL=socket.js.map