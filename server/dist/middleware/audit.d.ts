import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
export declare function auditLog(entity: string): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=audit.d.ts.map