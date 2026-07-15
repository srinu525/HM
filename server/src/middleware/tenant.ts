import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { AppError } from "../common/errors/AppError";

export const tenantScope = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user?.organizationId) {
    return next(AppError.forbidden("No organization context"));
  }
  next();
};
