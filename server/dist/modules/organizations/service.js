import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
export class OrganizationService {
    async getAll() {
        return prisma.organization.findMany({
            include: { _count: { select: { users: true, patients: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
    async getById(id) {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: { _count: { select: { users: true, patients: true } } },
        });
        if (!org)
            throw AppError.notFound("Organization not found");
        return org;
    }
    async create(data) {
        const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
        if (existing)
            throw AppError.badRequest("Slug already taken");
        return prisma.organization.create({ data });
    }
    async update(id, data) {
        const org = await prisma.organization.findUnique({ where: { id } });
        if (!org)
            throw AppError.notFound("Organization not found");
        return prisma.organization.update({
            where: { id },
            data,
            include: { _count: { select: { users: true, patients: true } } },
        });
    }
    async getStats(id) {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                _count: { select: { users: true, patients: true, medicines: true, notifications: true } },
            },
        });
        if (!org)
            throw AppError.notFound("Organization not found");
        return org;
    }
}
export const organizationService = new OrganizationService();
//# sourceMappingURL=service.js.map