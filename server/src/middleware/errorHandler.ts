import { Response, NextFunction } from "express";
import { logger } from "../common/logger";
import { env } from "../config/env";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (err: AppError, req: { method: string; url: string }, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  if (statusCode >= 500) {
    logger.error({ err, method: req.method, url: req.url }, "Server error");
  } else {
    logger.warn({ method: req.method, url: req.url, statusCode, message }, "Client error");
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
};
