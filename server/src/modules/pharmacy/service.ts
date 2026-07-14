import { prisma } from "../../utils/prisma";

export class PharmacyService {
  async getAllMedicines(search?: string) {
    const where = search
      ? {
          name: { contains: search, mode: "insensitive" as const },
          isActive: true,
        }
      : { isActive: true };

    return prisma.medicine.findMany({
      where,
      orderBy: { name: "asc" },
    });
  }

  async createMedicine(data: { name: string; description?: string; price: number; stock: number }) {
    return prisma.medicine.create({ data });
  }

  async updateStock(id: string, stock: number) {
    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) {
      throw { statusCode: 404, message: "Medicine not found" };
    }

    return prisma.medicine.update({
      where: { id },
      data: { stock },
    });
  }

  async createSale(data: { patientId: string; items: { medicineId: string; quantity: number }[] }) {
    let total = 0;
    const saleItems = [];

    for (const item of data.items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        throw { statusCode: 404, message: `Medicine not found: ${item.medicineId}` };
      }

      if (medicine.stock < item.quantity) {
        throw { statusCode: 400, message: `Insufficient stock for ${medicine.name}` };
      }

      const itemTotal = medicine.price * item.quantity;
      total += itemTotal;

      saleItems.push({
        medicineId: item.medicineId,
        quantity: item.quantity,
        unitPrice: medicine.price,
        total: itemTotal,
      });

      await prisma.medicine.update({
        where: { id: item.medicineId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return prisma.sale.create({
      data: {
        patientId: data.patientId,
        total,
        items: {
          create: saleItems,
        },
      },
      include: {
        items: {
          include: { medicine: { select: { id: true, name: true } } },
        },
        patient: { select: { id: true, name: true } },
      },
    });
  }

  async getSales() {
    return prisma.sale.findMany({
      include: {
        items: {
          include: { medicine: { select: { id: true, name: true } } },
        },
        patient: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async createPrescription(data: { patientId: string; consultationId: string; notes?: string; items: { medicineId: string; dosage: string; duration: string; instructions?: string; quantity?: number }[] }) {
    return prisma.prescription.create({
      data: {
        patientId: data.patientId,
        consultationId: data.consultationId,
        notes: data.notes,
        items: {
          create: data.items,
        },
      },
      include: {
        items: {
          include: { medicine: { select: { id: true, name: true } } },
        },
      },
    });
  }
}

export const pharmacyService = new PharmacyService();
