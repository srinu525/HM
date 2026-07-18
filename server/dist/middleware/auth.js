import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../common/errors/AppError";
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(AppError.unauthorized("No token provided"));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        next(AppError.unauthorized("Invalid or expired token"));
    }
};
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(AppError.unauthorized("Not authenticated"));
        }
        if (!roles.includes(req.user.role)) {
            return next(AppError.forbidden("Insufficient permissions"));
        }
        next();
    };
};
//# sourceMappingURL=auth.js.map