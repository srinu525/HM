import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { permissionService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";
import { AppError } from "../../common/errors/AppError";

export class PermissionController {
  async getMyPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionService.getMyPermissions(
        req.user!.id,
        req.user!.role as Role,
        req.user!.organizationId ?? null
      );
      sendSuccess(res, permissions, "Your permissions fetched");
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await permissionService.getAll();
      sendSuccess(res, permissions, "Permissions fetched");
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.params.role as Role;
      const permissions = await permissionService.getRolePermissions(role);
      sendSuccess(res, permissions, "Role permissions fetched");
    } catch (error) {
      next(error);
    }
  }

  async setRolePermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const role = req.params.role as Role;
      const { permissionIds } = req.body as { permissionIds: string[] };
      if (!Array.isArray(permissionIds)) {
        throw AppError.badRequest("permissionIds must be an array");
      }
      const permissions = await permissionService.setRolePermissions(role, permissionIds);
      sendSuccess(res, permissions, "Role permissions updated");
    } catch (error) {
      next(error);
    }
  }

  async getUserPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const permissions = await permissionService.getUserPermissions(userId);
      sendSuccess(res, permissions, "User permissions fetched");
    } catch (error) {
      next(error);
    }
  }

  async setUserPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId as string;
      const { permissions } = req.body as {
        permissions: { permissionId: string; granted: boolean }[];
      };
      if (!Array.isArray(permissions)) {
        throw AppError.badRequest("permissions must be an array");
      }
      const result = await permissionService.setUserPermissions(userId, permissions);
      sendSuccess(res, result, "User permissions updated");
    } catch (error) {
      next(error);
    }
  }

  async seedPermissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await permissionService.seedPermissions();
      sendSuccess(res, result, "Permissions seeded");
    } catch (error) {
      next(error);
    }
  }
}

export const permissionController = new PermissionController();
