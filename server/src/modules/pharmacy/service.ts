import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
import { eventBus } from "../../common/event-bus";

export class PharmacyService {
  async getAllMedicines(search: string | undefined, organizationId: string) {
    const where: any = { organizationId, isActive: true };
    if (search) {
      where.name = { contains: search, mode: "insensitive" as const };
    }
    return prisma.medicine.findMany({ where, orderBy: { name: "asc" } });
  }

  async createMedicine(data: { name: string; description?: string; price: number; stock: number; expiryDate?: string; batchNumber?: string; reorderLevel?: number }, organizationId: string) {
    const medicineData: any = { ...data, organizationId };
    if (data.expiryDate) medicineData.expiryDate = new Date(data.expiryDate);
    return prisma.medicine.create({ data: medicineData });
  }

  async updateStock(id: string, stock: number, organizationId: string) {
    const medicine = await prisma.medicine.findFirst({ where: { id, organizationId } });
    if (!medicine) { throw AppError.notFound("Medicine not found"); }
    return prisma.medicine.update({ where: { id }, data: { stock } });
  }

  async updateMedicine(id: string, data: { name?: string; description?: string; price?: number; stock?: number; expiryDate?: string; batchNumber?: string; reorderLevel?: number; isActive?: boolean }, organizationId: string) {
    const medicine = await prisma.medicine.findFirst({ where: { id, organizationId } });
    if (!medicine) { throw AppError.notFound("Medicine not found"); }
    const updateData: any = { ...data };
    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);
    return prisma.medicine.update({ where: { id }, data: updateData });
  }

  async getInventoryAlerts(organizationId: string) {
    const allMedicines = await prisma.medicine.findMany({
      where: { organizationId, isActive: true },
      select: { id: true, name: true, stock: true, reorderLevel: true, expiryDate: true, batchNumber: true, price: true },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now); thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const ninetyDaysFromNow = new Date(now); ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);

    const lowStock = allMedicines.filter(m => m.stock <= m.reorderLevel);
    const expiringSoon = allMedicines.filter(m => m.expiryDate && m.expiryDate <= ninetyDaysFromNow);
    const expired = allMedicines.filter(m => m.expiryDate && m.expiryDate < now);

    return { lowStock, expiringSoon, expired };
  }

  async createSale(data: { patientId: string; items: { medicineId: string; quantity: number }[]; prescriptionId?: string }, organizationId: string) {
    let prescription: { id: string; status: string; patientId: string } | null = null;
    if (data.prescriptionId) {
      prescription = await prisma.prescription.findFirst({
        where: {
          id: data.prescriptionId,
          patient: { organizationId },
          patientId: data.patientId,
        },
        select: { id: true, status: true, patientId: true },
      });
      if (!prescription) {
        throw AppError.notFound("Prescription not found for this patient");
      }
      if (prescription.status === "DISPENSED") {
        throw AppError.badRequest("This prescription has already been dispensed");
      }
    }

    let total = 0;
    const saleItems: { medicineId: string; quantity: number; unitPrice: number; total: number }[] = [];
    const lowStockMedicines = [];
    const expiryWarnings: { id: string; name: string; expiryDate: string }[] = [];

    for (const item of data.items) {
      const medicine = await prisma.medicine.findFirst({ where: { id: item.medicineId, organizationId } });
      if (!medicine) { throw AppError.notFound(`Medicine not found: ${item.medicineId}`); }
      if (medicine.stock < item.quantity) {
        throw AppError.badRequest(`Insufficient stock for ${medicine.name}`);
      }

      const itemTotal = medicine.price * item.quantity;
      total += itemTotal;
      saleItems.push({ medicineId: item.medicineId, quantity: item.quantity, unitPrice: medicine.price, total: itemTotal });

      if (medicine.expiryDate) {
        const now = new Date();
        const daysUntilExpiry = Math.ceil((medicine.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilExpiry <= 30) {
          expiryWarnings.push({ id: medicine.id, name: medicine.name, expiryDate: medicine.expiryDate.toISOString() });
        }
      }

      const newStock = medicine.stock - item.quantity;
      await prisma.medicine.update({ where: { id: item.medicineId }, data: { stock: newStock } });

      if (newStock < 10) {
        lowStockMedicines.push({ id: medicine.id, name: medicine.name, stock: newStock });
      }
    }

    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          patientId: data.patientId,
          total,
          prescriptionId: data.prescriptionId || undefined,
          items: { create: saleItems },
        },
        include: {
          items: { include: { medicine: { select: { id: true, name: true } } } },
          patient: { select: { id: true, patientId: true, name: true } },
        },
      });

      if (data.prescriptionId && prescription) {
        await tx.prescription.update({
          where: { id: data.prescriptionId },
          data: { status: "DISPENSED" },
        });
      }

      return created;
    });

    if (lowStockMedicines.length > 0) {
      eventBus.emitEvent("low-stock-alert", {
        type: "low-stock-alert",
        payload: { medicines: lowStockMedicines },
        organizationId,
      });
    }

    return { ...sale, expiryWarnings };
  }

  async getSales(organizationId: string) {
    return prisma.sale.findMany({
      include: {
        items: { include: { medicine: { select: { id: true, name: true } } } },
        patient: { select: { id: true, patientId: true, name: true } },
        prescription: { select: { id: true, status: true } },
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
