import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class UserController {
    getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getUserById(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getDoctors(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const userController: UserController;
//# sourceMappingURL=controller.d.ts.map