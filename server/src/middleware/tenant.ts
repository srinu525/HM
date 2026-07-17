import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const tenantScope = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role === "SUPER_ADMIN") {
    return next();
  }
  if (!req.user?.organizationId) {
    return next(new Error("No organization context"));
  }
  next();
};
