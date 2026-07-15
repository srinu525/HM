import { Response, NextFunction } from "express";
import { userService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess } from "../../common/response";

export class UserController {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers(req.user!.organizationId);
      sendSuccess(res, users, "Users fetched");
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id, req.user!.organizationId);
      sendSuccess(res, user, "User fetched");
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id, req.body, req.user!.organizationId);
      sendSuccess(res, user, "User updated");
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctors = await userService.getDoctors(req.user!.organizationId);
      sendSuccess(res, doctors, "Doctors fetched");
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
