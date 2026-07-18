import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
export declare class LabController {
    getTests(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createTest(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateTest(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    getResults(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    createResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
    updateResult(req: AuthRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const labController: LabController;
//# sourceMappingURL=controller.d.ts.map