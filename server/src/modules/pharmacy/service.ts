import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class PharmacyService {
  async getAllMedicines(search: string | undefined, organizationId: string) {
    const where: any = { organizationId, isActive: true };
    if (search) {
      where.name = { contains: search, mode: "insensitive" as const };
    }
    return prisma.medicine.findMany({ where, orderBy: { name: "asc" } });
  }

  async createMedicine(data: { name: string; description?: string; price: number; stock: number }, organizationId: string) {
    return prisma.medicine.create({ data: { ...data, organizationId } });
  }

  async updateStock(id: string, stock: number, organizationId: string) {
    const medicine = await prisma.medicine.findFirst({ where: { id, organizationId } });
    if (!medicine) { throw AppError.notFound("Medicine not found"); }
    return prisma.medicine.update({ where: { id }, data: { stock } });
  }

  async createSale(data: { patientId: string; items: { medicineId: string; quantity: number }[] }, organizationId: string) {
    let total = 0;
    const saleItems = [];
    const lowStockMedicines = [];

    for (const item of data.items) {
      const medicine = await prisma.medicine.findFirst({ where: { id: item.medicineId, organizationId } });
      if (!medicine) { throw AppError.notFound(`Medicine not found: ${item.medicineId}`); }
      if (medicine.stock < item.quantity) {
        throw AppError.badRequest(`Insufficient stock for ${medicine.name}`);
      }

      const itemTotal = medicine.price * item.quantity;
      total += itemTotal;
      saleItems.push({ medicineId: item.medicineId, quantity: item.quantity, unitPrice: medicine.price, total: itemTotal });

      const newStock = medicine.stock - item.quantity;
      await prisma.medicine.update({ where: { id: item.medicineId }, data: { stock: newStock } });

      if (newStock < 10) {
        lowStockMedicines.push({ id: medicine.id, name: medicine.name, stock: newStock });
      }
    }

    const sale = await prisma.sale.create({
      data: { patientId: data.patientId, total, items: { create: saleItems } },
      include: {
        items: { include: { medicine: { select: { id: true, name: true } } } },
        patient: { select: { id: true, patientId: true, name: true } },
      },
    });

    if (lowStockMedicines.length > 0) {
      const { getIO } = await import("../../socket");
      getIO().emit("low-stock-alert", {
        medicines: lowStockMedicines,
        message: `Low stock alert: ${lowStockMedicines.map(m => m.name).join(", ")}`,
        timestamp: new Date().toISOString(),
      });
    }

    return sale;
  }

  async getSales(organizationId: string) {
    return prisma.sale.findMany({
      include: {
        items: { include: { medicine: { select: { id: true, name: true } } } },
        patient: { select: { id: true, patientId: true, name: true } },
      },
      orderBy: { createdAt: "desc" }, take: 50,
    });
  }

  async getPrescriptions(filters: { patientId?: string; doctorId?: string; startDate?: string; endDate?: string }, organizationId: string) {
    const where: Record<string, unknown> = {};
    if (filters?.patientId) { where.patientId = filters.patientId; }
    if (filters?.doctorId || filters?.startDate || filters?.endDate) {
      const consultationWhere: Record<string, unknown> = {};
      if (filters.doctorId) { consultationWhere.doctorId = filters.doctorId; }
      if (filters.startDate || filters.endDate) {
        consultationWhere.createdAt = {};
        if (filters.startDate) { (consultationWhere.createdAt as any).gte = new Date(filters.startDate); }
        if (filters.endDate) { (consultationWhere.createdAt as any).lte = new Date(filters.endDate); }
      }
      where.consultation = consultationWhere;
    }

    return prisma.prescription.findMany({
      where,
      include: {
        items: { include: { medicine: { select: { id: true, name: true, price: true } } } },
        patient: { select: { id: true, patientId: true, name: true, phone: true } },
        consultation: {
          include: {
            doctor: { select: { id: true, name: true } },
            appointment: { select: { token: true, date: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" }, take: 100,
    });
  }

  async createPrescription(data: { patientId: string; consultationId: string; notes?: string; items: { medicineId: string; dosage: string; duration: string; instructions?: string; quantity?: number }[] }, organizationId: string) {
    return prisma.prescription.create({
      data: {
        patientId: data.patientId, consultationId: data.consultationId, notes: data.notes,
        items: { create: data.items.map((item) => ({ ...item, quantity: Number(item.quantity) || 1 })) },
      },
      include: { items: { include: { medicine: { select: { id: true, name: true } } } } },
    });
  }
}

export const pharmacyService = new PharmacyService();
