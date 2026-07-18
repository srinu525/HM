import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
export class UserService {
    async getAllUsers(organizationId) {
        return prisma.user.findMany({
            where: { organizationId },
            select: {
                id: true, name: true, email: true, role: true,
                phone: true, isActive: true, createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }
    async getUserById(id, organizationId) {
        const user = await prisma.user.findFirst({
            where: { id, organizationId },
            select: {
                id: true, name: true, email: true, role: true,
                phone: true, isActive: true, createdAt: true,
            },
        });
        if (!user) {
            throw AppError.notFound("User not found");
        }
        return user;
    }
    async updateUser(id, data, organizationId) {
        const user = await prisma.user.findFirst({ where: { id, organizationId } });
        if (!user) {
            throw AppError.notFound("User not found");
        }
        return prisma.user.update({
            where: { id },
            data: { ...data, role: data.role ? data.role : undefined },
            select: {
                id: true, name: true, email: true, role: true,
                phone: true, isActive: true, createdAt: true,
            },
        });
    }
    async getDoctors(organizationId) {
        return prisma.user.findMany({
            where: { role: "DOCTOR", isActive: true, organizationId },
            select: { id: true, name: true, email: true, phone: true },
            orderBy: { name: "asc" },
        });
    }
}
export const userService = new UserService();
//# sourceMappingURL=service.js.map