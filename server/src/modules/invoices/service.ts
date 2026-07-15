import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class InvoiceService {
  async getAll(organizationId: string, filters: { status?: string; patientId?: string }) {
    const where: any = { organizationId };
    if (filters.status) where.status = filters.status;
    if (filters.patientId) where.patientId = filters.patientId;

    return prisma.invoice.findMany({
      where,
      include: {
        items: true,
        payments: { orderBy: { createdAt: "desc" } },
        patient: { select: { id: true, patientId: true, name: true, phone: true } },
        subscription: { include: { plan: { select: { name: true, price: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async getById(id: string, organizationId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, organizationId },
      include: {
        items: true,
        payments: { orderBy: { createdAt: "desc" } },
        patient: { select: { id: true, patientId: true, name: true, phone: true, email: true, address: true } },
        subscription: { include: { plan: true } },
        organization: { select: { name: true, address: true, phone: true, email: true } },
      },
    });
    if (!invoice) throw AppError.notFound("Invoice not found");
    return invoice;
  }

  async create(data: {
    description?: string;
    patientId?: string;
    subscriptionId?: string;
    tax?: number;
    dueDate?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
  }, organizationId: string) {
    if (!data.items || data.items.length === 0) throw AppError.badRequest("At least one item is required");

    const count = await prisma.invoice.count({ where: { organizationId } });
    const invoiceNumber = `INV-${String(count + 1).padStart(5, "0")}`;

    const amount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const tax = data.tax || 0;
    const total = amount + tax;

    return prisma.invoice.create({
      data: {
        invoiceNumber,
        amount,
        tax,
        total,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        patientId: data.patientId,
        subscriptionId: data.subscriptionId,
        organizationId,
        items: {
          create: data.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true, patient: { select: { id: true, patientId: true, name: true } } },
    });
  }

  async updateStatus(id: string, status: string, organizationId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, organizationId } });
    if (!invoice) throw AppError.notFound("Invoice not found");

    const updateData: any = { status };
    if (status === "PAID") updateData.paidAt = new Date();

    return prisma.invoice.update({ where: { id }, data: updateData });
  }

  async delete(id: string, organizationId: string) {
    const invoice = await prisma.invoice.findFirst({ where: { id, organizationId } });
    if (!invoice) throw AppError.notFound("Invoice not found");
    if (invoice.status === "PAID") throw AppError.badRequest("Cannot delete a paid invoice");

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    await prisma.payment.deleteMany({ where: { invoiceId: id } });
    return prisma.invoice.delete({ where: { id } });
  }

  async recordPayment(data: {
    invoiceId?: string;
    patientId?: string;
    amount: number;
    method?: string;
    reference?: string;
    notes?: string;
  }, organizationId: string) {
    if (data.invoiceId) {
      const invoice = await prisma.invoice.findFirst({ where: { id: data.invoiceId, organizationId } });
      if (!invoice) throw AppError.notFound("Invoice not found");

      const totalPaid = await prisma.payment.aggregate({
        where: { invoiceId: data.invoiceId, status: "COMPLETED" },
        _sum: { amount: true },
      });
      const alreadyPaid = totalPaid._sum.amount || 0;
      if (alreadyPaid + data.amount > invoice.total) {
        throw AppError.badRequest(`Payment exceeds invoice balance. Remaining: ₹${invoice.total - alreadyPaid}`);
      }
    }

    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        method: data.method || "CASH",
        reference: data.reference,
        notes: data.notes,
        invoiceId: data.invoiceId,
        patientId: data.patientId,
        organizationId,
      },
      include: {
        patient: { select: { id: true, patientId: true, name: true } },
      },
    });

    if (data.invoiceId) {
      const totalPaid = await prisma.payment.aggregate({
        where: { invoiceId: data.invoiceId, status: "COMPLETED" },
        _sum: { amount: true },
      });
      const invoice = await prisma.invoice.findFirst({ where: { id: data.invoiceId } });
      if (invoice && (totalPaid._sum.amount || 0) >= invoice.total) {
        await prisma.invoice.update({ where: { id: data.invoiceId }, data: { status: "PAID", paidAt: new Date() } });
      }
    }

    return payment;
  }

  async getPayments(organizationId: string, filters: { patientId?: string; method?: string }) {
    const where: any = { organizationId };
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.method) where.method = filters.method;

    return prisma.payment.findMany({
      where,
      include: {
        patient: { select: { id: true, patientId: true, name: true } },
        invoice: { select: { id: true, invoiceNumber: true, total: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  async getStats(organizationId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalInvoices, pendingInvoices, totalRevenue, recentPayments] = await Promise.all([
      prisma.invoice.count({ where: { organizationId } }),
      prisma.invoice.count({ where: { organizationId, status: { in: ["DRAFT", "SENT"] } } }),
      prisma.payment.aggregate({ where: { organizationId, status: "COMPLETED" }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { organizationId, status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } }, _sum: { amount: true } }),
    ]);

    return {
      totalInvoices,
      pendingInvoices,
      totalRevenue: totalRevenue._sum.amount || 0,
      last30DaysRevenue: recentPayments._sum.amount || 0,
    };
  }
}

export const invoiceService = new InvoiceService();
