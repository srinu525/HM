import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";
export class AuthService {
    async register(name, email, password, role, organizationId, phone) {
        const org = await prisma.organization.findUnique({ where: { id: organizationId } });
        if (!org) {
            throw AppError.notFound("Organization not found");
        }
        const existingUser = await prisma.user.findUnique({
            where: { email_organizationId: { email, organizationId } },
        });
        if (existingUser) {
            throw AppError.conflict("Email already registered in this organization");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role,
                phone,
                organizationId,
            },
            include: { organization: { select: { id: true, name: true, slug: true } } },
        });
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                organization: user.organization,
            },
            token,
        };
    }
    async login(email, password, organizationSlug) {
        const org = await prisma.organization.findUnique({ where: { slug: organizationSlug } });
        if (!org) {
            throw AppError.notFound("Organization not found");
        }
        const user = await prisma.user.findUnique({
            where: { email_organizationId: { email, organizationId: org.id } },
            include: { organization: { select: { id: true, name: true, slug: true } } },
        });
        if (!user) {
            throw AppError.unauthorized("Invalid credentials");
        }
        if (!user.isActive) {
            throw AppError.forbidden("Account is deactivated");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw AppError.unauthorized("Invalid credentials");
        }
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
                organization: user.organization,
            },
            token,
        };
    }
    async loginSuperAdmin(email, password) {
        const user = await prisma.user.findFirst({
            where: { email, role: "SUPER_ADMIN" },
        });
        if (!user) {
            throw AppError.unauthorized("Invalid credentials");
        }
        if (!user.isActive) {
            throw AppError.forbidden("Account is deactivated");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw AppError.unauthorized("Invalid credentials");
        }
        const token = this.generateToken(user);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: null,
                organization: null,
            },
            token,
        };
    }
    async getProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                isActive: true,
                createdAt: true,
                organizationId: true,
                organization: { select: { id: true, name: true, slug: true } },
            },
        });
        if (!user) {
            throw AppError.notFound("User not found");
        }
        return user;
    }
    generateToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        if (user.organizationId) {
            payload.organizationId = user.organizationId;
        }
        return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    }
}
export const authService = new AuthService();
//# sourceMappingURL=service.js.map