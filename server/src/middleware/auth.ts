import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../common/errors/AppError";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("No token provided"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
      organizationId: string;
    };
    req.user = decoded;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token"));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(AppError.unauthorized("Not authenticated"));
    }

    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden("Insufficient permissions"));
    }

    next();
  };
};
