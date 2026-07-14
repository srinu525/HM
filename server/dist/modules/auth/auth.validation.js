"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerOrganizationSchema = void 0;
const zod_1 = require("zod");
exports.registerOrganizationSchema = zod_1.z.object({
    organizationName: zod_1.z.string().min(2),
    organizationSlug: zod_1.z.string().min(2).regex(/^[a-z0-9-]+$/),
    adminName: zod_1.z.string().min(2),
    adminEmail: zod_1.z.string().email(),
    adminPassword: zod_1.z.string().min(8),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
