import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class PatientService {
  async create(data: { name: string; phone: string; email?: string; gender: string; age: number; dob?: string; address: string }, organizationId: string) {
    const count = await prisma.patient.count({ where: { organizationId } });
    const patientId = "PAT-" + String(count + 1).padStart(4, "0");

    return prisma.patient.create({
      data: {
        patientId, name: data.name, phone: data.phone, email: data.email,
        gender: data.gender as any, age: data.age,
        dob: data.dob ? new Date(data.dob) : null, address: data.address,
        organizationId,
      },
    });
  }

  async getAll(search: string | undefined, organizationId: string, page = 1, limit = 20) {
    const where: any = { organizationId };
    if (search) {
      where.OR = [
        { patientId: { contains: search, mode: "insensitive" as const } },
        { name: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
        { email: { contains: search, mode: "insensitive" as const } },
      ];
    }
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ]);
    return { patients, total, page, limit };
  }

  async getById(id: string, organizationId: string) {
    const patient = await prisma.patient.findFirst({
      where: { id, organizationId },
      include: {
        appointments: { orderBy: { date: "desc" }, take: 5 },
        prescriptions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!patient) { throw AppError.notFound("Patient not found"); }
    return patient;
  }

  async update(id: string, data: { name?: string; phone?: string; email?: string; age?: number; dob?: string; address?: string }, organizationId: string) {
    const patient = await prisma.patient.findFirst({ where: { id, organizationId } });
    if (!patient) { throw AppError.notFound("Patient not found"); }
    return prisma.patient.update({ where: { id }, data });
  }
}

export const patientService = new PatientService();
