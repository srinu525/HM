import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class FileController {
    upload(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getByEntity(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    download(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const fileController: FileController;
//# sourceMappingURL=controller.d.ts.map