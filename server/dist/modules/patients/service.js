import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
export class PatientService {
    async create(data, organizationId) {
        const count = await prisma.patient.count({ where: { organizationId } });
        const patientId = "PAT-" + String(count + 1).padStart(4, "0");
        return prisma.patient.create({
            data: {
                patientId, name: data.name, phone: data.phone, email: data.email,
                gender: data.gender, age: data.age,
                dob: data.dob ? new Date(data.dob) : null, address: data.address,
                organizationId,
            },
        });
    }
    async getAll(search, organizationId, page = 1, limit = 20) {
        const where = { organizationId };
        if (search) {
            where.OR = [
                { patientId: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { email: { contains: search, mode: "insensitive" } },
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
    async getById(id, organizationId) {
        const patient = await prisma.patient.findFirst({
            where: { id, organizationId },
            include: {
                appointments: { orderBy: { date: "desc" }, take: 5 },
                prescriptions: { orderBy: { createdAt: "desc" }, take: 5 },
            },
        });
        if (!patient) {
            throw AppError.notFound("Patient not found");
        }
        return patient;
    }
    async update(id, data, organizationId) {
        const patient = await prisma.patient.findFirst({ where: { id, organizationId } });
        if (!patient) {
            throw AppError.notFound("Patient not found");
        }
        return prisma.patient.update({ where: { id }, data });
    }
}
export const patientService = new PatientService();
//# sourceMappingURL=service.js.map