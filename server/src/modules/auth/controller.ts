import { Request, Response, NextFunction } from "express";
import { authService } from "./service";
import { AuthRequest } from "../../middleware/auth";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, phone } = req.body;
      const result = await authService.register(name, email, password, role, phone);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
