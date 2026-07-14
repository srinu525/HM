import { prisma } from "../../utils/prisma";

export class PatientService {
  async create(data: { name: string; phone: string; email?: string; gender: string; dob: string; address: string }) {
    return prisma.patient.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        gender: data.gender as any,
        dob: new Date(data.dob),
        address: data.address,
      },
    });
  }

  async getAll(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    return prisma.patient.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { orderBy: { date: "desc" }, take: 5 },
        prescriptions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!patient) {
      throw { statusCode: 404, message: "Patient not found" };
    }

    return patient;
  }

  async update(id: string, data: { name?: string; phone?: string; email?: string; address?: string }) {
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      throw { statusCode: 404, message: "Patient not found" };
    }

    return prisma.patient.update({
      where: { id },
      data,
    });
  }
}

export const patientService = new PatientService();
