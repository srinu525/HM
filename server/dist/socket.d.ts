import { Server } from "socket.io";
import type http from "http";
export declare function initSocket(httpServer: http.Server, corsOrigin: string): Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare function getIO(): Server;
//# sourceMappingURL=socket.d.ts.map