import { Response } from "express";
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
    };
}
export declare function sendSuccess<T>(res: Response, data: T, message?: string, statusCode?: number): Response<any, Record<string, any>>;
export declare function sendCreated<T>(res: Response, data: T, message?: string): Response<any, Record<string, any>>;
export declare function sendError(res: Response, message?: string, statusCode?: number): Response<any, Record<string, any>>;
export declare function sendPaginated<T>(res: Response, data: T, total: number, page: number, limit: number, message?: string): Response<any, Record<string, any>>;
//# sourceMappingURL=response.d.ts.map