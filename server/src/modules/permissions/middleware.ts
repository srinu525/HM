import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import { AppError } from "../../common/errors/AppError";
import { Role } from "@prisma/client";
import { prisma } from "../../utils/prisma";

export const authorizePermission = (...permissionNames: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(AppError.unauthorized("Not authenticated"));
      }

      const { id, role } = req.user;

      if (role === "SUPER_ADMIN") {
        return next();
      }

      for (const name of permissionNames) {
        const permission = await prisma.permission.findUnique({ where: { name } });
        if (!permission) {
          return next(AppError.forbidden(`Permission "${name}" not found`));
        }

        const rolePerm = await prisma.rolePermission.findUnique({
          where: { role_permissionId: { role: role as Role, permissionId: permission.id } },
        });
        if (rolePerm) continue;

        const userPerm = await prisma.userPermission.findUnique({
          where: { userId_permissionId: { userId: id, permissionId: permission.id } },
        });
        if (userPerm && userPerm.granted) continue;

        return next(AppError.forbidden("Insufficient permissions"));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
