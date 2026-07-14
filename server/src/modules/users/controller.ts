import { Response, NextFunction } from "express";
import { userService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class UserController {
  async getAllUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id as string);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(req.params.id as string, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getDoctors(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const doctors = await userService.getDoctors();
      res.json(doctors);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
