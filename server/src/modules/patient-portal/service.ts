import { prisma } from "../../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../../common/errors/AppError";

export class PatientPortalService {
  async login(email: string, password: string, organizationSlug: string) {
    const org = await prisma.organization.findUnique({ where: { slug: organizationSlug } });
    if (!org) throw AppError.notFound("Organization not found");

    const patient = await prisma.patient.findFirst({
      where: { email, organizationId: org.id },
    });
    if (!patient) throw AppError.unauthorized("Invalid credentials");
    if (!patient.isActive) throw AppError.forbidden("Account is deactivated");
    if (!patient.password) throw AppError.unauthorized("No password set. Contact reception to set up your account.");

    const isValid = await bcrypt.compare(password, patient.password);
    if (!isValid) throw AppError.unauthorized("Invalid credentials");

    const token = jwt.sign(
      { id: patient.id, patientId: patient.patientId, email: patient.email, organizationId: org.id, role: "PATIENT" },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );

    return {
      patient: {
        id: patient.id,
        patientId: patient.patientId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        age: patient.age,
        organizationId: patient.organizationId,
        organization: { id: org.id, name: org.name, slug: org.slug },
      },
      token,
    };
  }

  async getProfile(patientId: string) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        organization: { select: { id: true, name: true, slug: true } },
      },
    });
    if (!patient) throw AppError.notFound("Patient not found");
    return patient;
  }

  async updateProfile(patientId: string, data: { name?: string; phone?: string; address?: string; password?: string }) {
    const patient = await prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw AppError.notFound("Patient not found");

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    return prisma.patient.update({ where: { id: patientId }, data: updateData });
  }

  async getAppointments(patientId: string) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: { select: { id: true, name: true } },
        consultation: { select: { id: true, diagnosis: true, notes: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    });
  }

  async bookAppointment(data: { doctorId: string; notes?: string; consultationFee?: number }, patientId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastToken = await prisma.appointment.findFirst({
      where: {
        doctorId: data.doctorId,
        date: { gte: today, lt: new Date(today.getTime() + 86400000) },
      },
      orderBy: { token: "desc" },
    });
    const token = (lastToken?.token || 0) + 1;

    return prisma.appointment.create({
      data: {
        patientId,
        doctorId: data.doctorId,
        notes: data.notes,
        consultationFee: data.consultationFee || 0,
        token,
      },
      include: {
        doctor: { select: { id: true, name: true } },
        patient: { select: { id: true, patientId: true, name: true } },
      },
    });
  }

  async getPrescriptions(patientId: string) {
    return prisma.prescription.findMany({
      where: { patientId },
      include: {
        items: { include: { medicine: { select: { id: true, name: true, price: true } } } },
        consultation: {
          include: {
            doctor: { select: { id: true, name: true } },
            appointment: { select: { token: true, date: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getLabResults(patientId: string) {
    return prisma.labResult.findMany({
      where: { patientId },
      include: {
        labTest: { select: { id: true, name: true, price: true } },
        doctor: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getInvoices(patientId: string, organizationId: string) {
    return prisma.invoice.findMany({
      where: { patientId, organizationId },
      include: {
        items: true,
        payments: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async getDoctors(organizationId: string) {
    return prisma.user.findMany({
      where: { role: "DOCTOR", isActive: true, organizationId },
      select: { id: true, name: true, email: true, phone: true },
    });
  }

  async payInvoice(invoiceId: string, patientId: string, organizationId: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, patientId, organizationId },
    });
    if (!invoice) throw AppError.notFound("Invoice not found");
    if (invoice.status === "PAID") throw AppError.badRequest("Invoice is already paid");

    const totalPaid = await prisma.payment.aggregate({
      where: { invoiceId, status: "COMPLETED" },
      _sum: { amount: true },
    });
    const remaining = invoice.total - (totalPaid._sum.amount || 0);
    if (remaining <= 0) throw AppError.badRequest("Invoice is already fully paid");

    const payment = await prisma.payment.create({
      data: {
        amount: remaining,
        method: "ONLINE",
        status: "COMPLETED",
        invoiceId,
        patientId,
        organizationId,
      },
    });

    await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidAt: new Date() } });

    return payment;
  }
}

export const patientPortalService = new PatientPortalService();
