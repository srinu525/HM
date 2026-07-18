import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";
import { AuthRequest } from "../../middleware/auth";

export const patientAuthenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(AppError.unauthorized("No token provided"));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    if (decoded.role !== "PATIENT") {
      return next(AppError.forbidden("Not a patient account"));
    }
    req.user = {
      id: decoded.id,
      email: decoded.email || "",
      role: "PATIENT",
      organizationId: decoded.organizationId,
    };
    next();
  } catch {
    return next(AppError.unauthorized("Invalid or expired token"));
  }
};
