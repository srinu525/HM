import { eventBus } from "../../common/event-bus";
import { prisma } from "../../utils/prisma";
import { getIO } from "../../socket";
import { logger } from "../../common/logger";

eventBus.registerHandler("patient.created", async (event) => {
  const { payload, organizationId } = event;
  const patient = payload.patient as { id: string; name: string };
  logger.info({ patientId: patient.id }, "Patient created event received");

  const users = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "RECEPTIONIST"] }, isActive: true },
    select: { id: true },
  });

  for (const user of users) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          message: `New patient registered: ${patient.name}`,
          type: "PATIENT_CREATED",
          organizationId,
        },
      });
      getIO().to(`user:${user.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to send patient-created notification");
    }
  }
});

eventBus.registerHandler("appointment.created", async (event) => {
  const { payload, organizationId } = event;
  const appointment = payload.appointment as { id: string; doctorId: string; patientName: string; token: number };
  logger.info({ appointmentId: appointment.id }, "Appointment created event received");

  const users = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "RECEPTIONIST"] }, isActive: true },
    select: { id: true },
  });

  for (const user of users) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          message: `New appointment: ${appointment.patientName} (Token #${appointment.token})`,
          type: "APPOINTMENT_CREATED",
          organizationId,
        },
      });
      getIO().to(`user:${user.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to send appointment-created notification");
    }
  }
});

eventBus.registerHandler("prescription.created", async (event) => {
  const { payload, organizationId } = event;
  const prescription = payload.prescription as { id: string; patientId: string };
  logger.info({ prescriptionId: prescription.id }, "Prescription created event received");

  const users = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "PHARMACIST"] }, isActive: true },
    select: { id: true },
  });

  for (const user of users) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          message: `New prescription created for patient`,
          type: "PRESCRIPTION_CREATED",
          organizationId,
        },
      });
      getIO().to(`user:${user.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to send prescription-created notification");
    }
  }
});

eventBus.registerHandler("low-stock-alert", async (event) => {
  const { payload, organizationId } = event;
  const medicines = payload.medicines as { id: string; name: string; stock: number }[];
  logger.warn({ medicines: medicines.map((m) => m.name) }, "Low stock alert event received");

  const users = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "PHARMACIST"] }, isActive: true },
    select: { id: true },
  });

  for (const user of users) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          message: `Low stock: ${medicines.map((m) => `${m.name} (${m.stock} left)`).join(", ")}`,
          type: "LOW_STOCK",
          organizationId,
        },
      });
      getIO().to(`user:${user.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to send low-stock notification");
    }
  }
});

eventBus.registerHandler("medicine.expiring", async (event) => {
  const { payload, organizationId } = event;
  const medicines = payload.medicines as { id: string; name: string; expiryDate: Date }[];
  logger.warn({ count: medicines.length }, "Medicine expiry event received");

  const admins = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "PHARMACIST"] }, isActive: true },
    select: { id: true },
  });

  for (const admin of admins) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `${medicines.length} medicine(s) expiring soon: ${medicines.slice(0, 5).map((m) => m.name).join(", ")}${medicines.length > 5 ? "..." : ""}`,
          type: "MEDICINE_EXPIRY",
          organizationId,
        },
      });
      getIO().to(`user:${admin.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: admin.id }, "Failed to send expiry notification");
    }
  }
});

eventBus.registerHandler("subscription.expiring", async (event) => {
  const { payload, organizationId } = event;
  const subscription = payload.subscription as { id: string; endDate: Date; planName: string };
  logger.warn({ subscriptionId: subscription.id }, "Subscription expiry event received");

  const admins = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
    select: { id: true },
  });

  for (const admin of admins) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `Your ${subscription.planName} subscription expires on ${subscription.endDate.toLocaleDateString()}. Please renew to avoid service interruption.`,
          type: "SUBSCRIPTION_EXPIRY",
          organizationId,
        },
      });
      getIO().to(`user:${admin.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: admin.id }, "Failed to send subscription notification");
    }
  }
});

eventBus.registerHandler("medicine.expired", async (event) => {
  const { payload, organizationId } = event;
  const medicines = payload.medicines as { id: string; name: string; expiryDate: Date }[];
  logger.warn({ count: medicines.length }, "Medicine expired event received");

  const admins = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "PHARMACIST"] }, isActive: true },
    select: { id: true },
  });

  for (const admin of admins) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `${medicines.length} medicine(s) expired: ${medicines.slice(0, 5).map((m) => m.name).join(", ")}${medicines.length > 5 ? "..." : ""}. Please remove from inventory.`,
          type: "MEDICINE_EXPIRED",
          organizationId,
        },
      });
      getIO().to(`user:${admin.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: admin.id }, "Failed to send medicine-expired notification");
    }
  }
});

eventBus.registerHandler("subscription.expired", async (event) => {
  const { payload, organizationId } = event;
  const subscription = payload as { subscriptionId: string; planName: string };
  logger.warn({ subscriptionId: subscription.subscriptionId }, "Subscription expired event received");

  const admins = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "SUPER_ADMIN"] }, isActive: true },
    select: { id: true },
  });

  for (const admin of admins) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `Your ${subscription.planName} subscription has expired. Please renew to continue using the service.`,
          type: "SUBSCRIPTION_EXPIRED",
          organizationId,
        },
      });
      getIO().to(`user:${admin.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: admin.id }, "Failed to send subscription-expired notification");
    }
  }
});

eventBus.registerHandler("appointment.reminder", async (event) => {
  const { payload, organizationId } = event;
  const data = payload as { appointmentId: string; patientName: string; doctorName: string; date: Date; token: number };
  logger.info({ appointmentId: data.appointmentId }, "Appointment reminder event received");

  const users = await prisma.user.findMany({
    where: { organizationId, role: { in: ["ADMIN", "RECEPTIONIST"] }, isActive: true },
    select: { id: true },
  });

  for (const user of users) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: user.id,
          message: `Reminder: ${data.patientName} has an appointment with Dr. ${data.doctorName} tomorrow (Token #${data.token})`,
          type: "APPOINTMENT_REMINDER",
          organizationId,
        },
      });
      getIO().to(`user:${user.id}`).emit("notification:new", notification);
    } catch (err) {
      logger.error({ err, userId: user.id }, "Failed to send appointment-reminder notification");
    }
  }
});
