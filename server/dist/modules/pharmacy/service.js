import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
import { eventBus } from "../../common/event-bus";
export class PharmacyService {
    async getAllMedicines(search, organizationId) {
        const where = { organizationId, isActive: true };
        if (search) {
            where.name = { contains: search, mode: "insensitive" };
        }
        return prisma.medicine.findMany({ where, orderBy: { name: "asc" } });
    }
    async createMedicine(data, organizationId) {
        const medicineData = { ...data, organizationId };
        if (data.expiryDate)
            medicineData.expiryDate = new Date(data.expiryDate);
        return prisma.medicine.create({ data: medicineData });
    }
    async updateStock(id, stock, organizationId) {
        const medicine = await prisma.medicine.findFirst({ where: { id, organizationId } });
        if (!medicine) {
            throw AppError.notFound("Medicine not found");
        }
        return prisma.medicine.update({ where: { id }, data: { stock } });
    }
    async updateMedicine(id, data, organizationId) {
        const medicine = await prisma.medicine.findFirst({ where: { id, organizationId } });
        if (!medicine) {
            throw AppError.notFound("Medicine not found");
        }
        const updateData = { ...data };
        if (data.expiryDate)
            updateData.expiryDate = new Date(data.expiryDate);
        return prisma.medicine.update({ where: { id }, data: updateData });
    }
    async getInventoryAlerts(organizationId) {
        const allMedicines = await prisma.medicine.findMany({
            where: { organizationId, isActive: true },
            select: { id: true, name: true, stock: true, reorderLevel: true, expiryDate: true, batchNumber: true, price: true },
        });
        const now = new Date();
        const thirtyDaysFromNow = new Date(now);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const ninetyDaysFromNow = new Date(now);
        ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
        const lowStock = allMedicines.filter(m => m.stock <= m.reorderLevel);
        const expiringSoon = allMedicines.filter(m => m.expiryDate && m.expiryDate <= ninetyDaysFromNow);
        const expired = allMedicines.filter(m => m.expiryDate && m.expiryDate < now);
        return { lowStock, expiringSoon, expired };
    }
    async createSale(data, organizationId) {
        let total = 0;
        const saleItems = [];
        const lowStockMedicines = [];
        for (const item of data.items) {
            const medicine = await prisma.medicine.findFirst({ where: { id: item.medicineId, organizationId } });
            if (!medicine) {
                throw AppError.notFound(`Medicine not found: ${item.medicineId}`);
            }
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
            eventBus.emitEvent("low-stock-alert", {
                type: "low-stock-alert",
                payload: { medicines: lowStockMedicines },
                organizationId,
            });
        }
        return sale;
    }
    async getSales(organizationId) {
        return prisma.sale.findMany({
            include: {
                items: { include: { medicine: { select: { id: true, name: true } } } },
                patient: { select: { id: true, patientId: true, name: true } },
            },
            orderBy: { createdAt: "desc" }, take: 50,
        });
    }
    async getPrescriptions(filters, organizationId) {
        const where = {};
        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }
        if (filters?.doctorId || filters?.startDate || filters?.endDate) {
            const consultationWhere = {};
            if (filters.doctorId) {
                consultationWhere.doctorId = filters.doctorId;
            }
            if (filters.startDate || filters.endDate) {
                consultationWhere.createdAt = {};
                if (filters.startDate) {
                    consultationWhere.createdAt.gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    consultationWhere.createdAt.lte = new Date(filters.endDate);
                }
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
    async createPrescription(data, organizationId) {
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
//# sourceMappingURL=service.js.map