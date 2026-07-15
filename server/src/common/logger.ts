import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
  level: env.isDevelopment ? "debug" : "info",
  transport: env.isDevelopment
    ? { target: "pino/file", options: { destination: 1 } }
    : undefined,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
