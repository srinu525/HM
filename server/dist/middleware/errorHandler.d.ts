import { Response, NextFunction } from "express";
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const errorHandler: (err: AppError, req: {
    method: string;
    url: string;
}, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map