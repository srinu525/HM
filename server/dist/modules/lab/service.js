import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
export class LabService {
    async getTests(organizationId) {
        return prisma.labTest.findMany({
            where: { organizationId, isActive: true },
            include: { _count: { select: { results: true } } },
            orderBy: { name: "asc" },
        });
    }
    async createTest(data, organizationId) {
        return prisma.labTest.create({ data: { ...data, organizationId } });
    }
    async updateTest(id, data, organizationId) {
        const test = await prisma.labTest.findFirst({ where: { id, organizationId } });
        if (!test)
            throw AppError.notFound("Lab test not found");
        return prisma.labTest.update({ where: { id }, data });
    }
    async getResults(organizationId, filters) {
        const where = { organizationId };
        if (filters.patientId)
            where.patientId = filters.patientId;
        if (filters.doctorId)
            where.doctorId = filters.doctorId;
        if (filters.labTestId)
            where.labTestId = filters.labTestId;
        if (filters.status)
            where.status = filters.status;
        return prisma.labResult.findMany({
            where,
            include: {
                labTest: { select: { id: true, name: true, price: true } },
                patient: { select: { id: true, patientId: true, name: true, phone: true } },
                doctor: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
        });
    }
    async createResult(data, organizationId) {
        const test = await prisma.labTest.findFirst({ where: { id: data.labTestId, organizationId } });
        if (!test)
            throw AppError.notFound("Lab test not found");
        return prisma.labResult.create({
            data: {
                labTestId: data.labTestId,
                patientId: data.patientId,
                doctorId: data.doctorId,
                result: data.result,
                notes: data.notes,
                status: data.status || "COMPLETED",
                organizationId,
            },
            include: {
                labTest: { select: { id: true, name: true } },
                patient: { select: { id: true, patientId: true, name: true } },
                doctor: { select: { id: true, name: true } },
            },
        });
    }
    async updateResult(id, data, organizationId) {
        const result = await prisma.labResult.findFirst({ where: { id, organizationId } });
        if (!result)
            throw AppError.notFound("Lab result not found");
        return prisma.labResult.update({
            where: { id },
            data: { ...data, result: data.result },
        });
    }
}
export const labService = new LabService();
//# sourceMappingURL=service.js.map