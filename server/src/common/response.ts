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

export function sendSuccess<T>(res: Response, data: T, message = "Success", statusCode = 200) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = "Created successfully") {
  return sendSuccess(res, data, message, 201);
}

export function sendError(res: Response, message = "Internal Server Error", statusCode = 500) {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  total: number,
  page: number,
  limit: number,
  message = "Success"
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: { page, limit, total },
  };
  return res.status(200).json(response);
}
