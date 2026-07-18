import { prisma } from "../../utils/prisma";
import { eventBus } from "../../common/event-bus";
import { logger } from "../../common/logger";
export async function runAppointmentReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    const appointments = await prisma.appointment.findMany({
        where: {
            date: { gte: tomorrow, lt: dayAfterTomorrow },
            status: "SCHEDULED",
        },
        include: {
            patient: { select: { id: true, name: true, phone: true, organizationId: true } },
            doctor: { select: { id: true, name: true } },
        },
    });
    logger.info({ count: appointments.length }, "Appointment reminders to send");
    for (const appointment of appointments) {
        const orgId = appointment.patient.organizationId;
        if (!orgId)
            continue;
        await eventBus.emitEvent("appointment.reminder", {
            type: "appointment.reminder",
            payload: {
                appointmentId: appointment.id,
                patientName: appointment.patient.name,
                doctorName: appointment.doctor.name,
                date: appointment.date,
                token: appointment.token,
            },
            organizationId: orgId,
        });
    }
}
//# sourceMappingURL=appointment-reminder.js.map