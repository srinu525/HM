import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class LabService {
  async getTests(organizationId: string) {
    return prisma.labTest.findMany({
      where: { organizationId, isActive: true },
      include: { _count: { select: { results: true } } },
      orderBy: { name: "asc" },
    });
  }

  async createTest(data: { name: string; description?: string; price?: number }, organizationId: string) {
    return prisma.labTest.create({ data: { ...data, organizationId } });
  }

  async updateTest(id: string, data: { name?: string; description?: string; price?: number; isActive?: boolean }, organizationId: string) {
    const test = await prisma.labTest.findFirst({ where: { id, organizationId } });
    if (!test) throw AppError.notFound("Lab test not found");
    return prisma.labTest.update({ where: { id }, data });
  }

  async getResults(organizationId: string, filters: { patientId?: string; doctorId?: string; labTestId?: string; status?: string }) {
    const where: any = { organizationId };
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.doctorId) where.doctorId = filters.doctorId;
    if (filters.labTestId) where.labTestId = filters.labTestId;
    if (filters.status) where.status = filters.status;

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

  async createResult(data: { labTestId: string; patientId: string; doctorId: string; result: Record<string, unknown>; notes?: string; status?: string }, organizationId: string) {
    const test = await prisma.labTest.findFirst({ where: { id: data.labTestId, organizationId } });
    if (!test) throw AppError.notFound("Lab test not found");

    return prisma.labResult.create({
      data: {
        labTestId: data.labTestId,
        patientId: data.patientId,
        doctorId: data.doctorId,
        result: data.result as any,
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

  async updateResult(id: string, data: { result?: Record<string, unknown>; notes?: string; status?: string }, organizationId: string) {
    const result = await prisma.labResult.findFirst({ where: { id, organizationId } });
    if (!result) throw AppError.notFound("Lab result not found");
    return prisma.labResult.update({
      where: { id },
      data: { ...data, result: data.result as any },
    });
  }
}

export const labService = new LabService();
