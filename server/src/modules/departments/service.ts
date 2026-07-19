import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class DepartmentService {
  async getAll(organizationId: string) {
    return prisma.department.findMany({
      where: { organizationId },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string, organizationId: string) {
    const department = await prisma.department.findFirst({
      where: { id, organizationId },
      include: { _count: { select: { users: true } } },
    });
    if (!department) { throw AppError.notFound("Department not found"); }
    return department;
  }

  async create(data: { name: string; description?: string; consultationFee?: number; workingHours?: string }, organizationId: string) {
    const existing = await prisma.department.findFirst({
      where: { name: data.name, organizationId },
    });
    if (existing) { throw AppError.badRequest("Department with this name already exists"); }
    return prisma.department.create({
      data: { ...data, organizationId },
      include: { _count: { select: { users: true } } },
    });
  }

  async update(id: string, data: { name?: string; description?: string; consultationFee?: number; workingHours?: string }, organizationId: string) {
    const department = await prisma.department.findFirst({ where: { id, organizationId } });
    if (!department) { throw AppError.notFound("Department not found"); }
    if (data.name && data.name !== department.name) {
      const duplicate = await prisma.department.findFirst({
        where: { name: data.name, organizationId, id: { not: id } },
      });
      if (duplicate) { throw AppError.badRequest("Department with this name already exists"); }
    }
    return prisma.department.update({
      where: { id },
      data,
      include: { _count: { select: { users: true } } },
    });
  }

  async toggleActive(id: string, organizationId: string) {
    const department = await prisma.department.findFirst({ where: { id, organizationId } });
    if (!department) { throw AppError.notFound("Department not found"); }
    return prisma.department.update({
      where: { id },
      data: { isActive: !department.isActive },
      include: { _count: { select: { users: true } } },
    });
  }
}

export const departmentService = new DepartmentService();
