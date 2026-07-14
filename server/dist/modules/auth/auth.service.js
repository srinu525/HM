"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class AuthService {
    async registerOrganization(input) {
        const existingOrg = await prisma_1.default.organization.findUnique({
            where: { slug: input.organizationSlug },
        });
        if (existingOrg) {
            throw new Error("Organization slug is already taken");
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: input.adminEmail },
        });
        if (existingUser) {
            throw new Error("Admin email is already registered");
        }
        const passwordHash = await bcrypt_1.default.hash(input.adminPassword, 10);
        const organization = await prisma_1.default.organization.create({
            data: {
                name: input.organizationName,
                slug: input.organizationSlug,
            },
        });
        const admin = await prisma_1.default.user.create({
            data: {
                organizationId: organization.id,
                name: input.adminName,
                email: input.adminEmail,
                password: passwordHash,
                role: client_1.Role.ADMIN,
            },
        });
        return {
            organization,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        };
    }
    async login(input) {
        const user = await prisma_1.default.user.findUnique({
            where: { email: input.email },
        });
        if (!user) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await bcrypt_1.default.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
        }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
            },
        };
    }
}
exports.AuthService = AuthService;
