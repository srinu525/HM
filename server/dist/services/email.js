import nodemailer from "nodemailer";
import { logger } from "../common/logger";
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const FROM = process.env.SMTP_FROM || "noreply@hospital.com";
export async function sendEmail(to, subject, html) {
    if (!process.env.SMTP_HOST) {
        logger.debug("SMTP not configured, skipping email");
        return null;
    }
    try {
        const result = await transporter.sendMail({ from: FROM, to, subject, html });
        logger.info({ to, subject, messageId: result.messageId }, "Email sent");
        return result;
    }
    catch (err) {
        logger.error({ err, to, subject }, "Failed to send email");
        throw err;
    }
}
export async function sendAppointmentReminder(to, patientName, doctorName, date, token) {
    const html = `
    <h2>Appointment Reminder</h2>
    <p>Dear ${patientName},</p>
    <p>This is a reminder for your upcoming appointment:</p>
    <ul>
      <li><strong>Doctor:</strong> Dr. ${doctorName}</li>
      <li><strong>Date:</strong> ${date.toLocaleDateString()}</li>
      <li><strong>Token:</strong> #${token}</li>
    </ul>
    <p>Please arrive 15 minutes before your scheduled time.</p>
    <p>Thank you!</p>
  `;
    return sendEmail(to, "Appointment Reminder", html);
}
export async function sendSubscriptionExpiry(to, orgName, planName, endDate) {
    const html = `
    <h2>Subscription Expiring Soon</h2>
    <p>Dear ${orgName} Admin,</p>
    <p>Your <strong>${planName}</strong> subscription will expire on <strong>${endDate.toLocaleDateString()}</strong>.</p>
    <p>Please renew your subscription to avoid service interruption.</p>
    <p>Thank you!</p>
  `;
    return sendEmail(to, "Subscription Expiring Soon", html);
}
export async function sendLowStockAlert(to, medicines) {
    const medicineList = medicines.map((m) => `<li>${m.name} - ${m.stock} units remaining</li>`).join("");
    const html = `
    <h2>Low Stock Alert</h2>
    <p>The following medicines are running low on stock:</p>
    <ul>${medicineList}</ul>
    <p>Please reorder as soon as possible.</p>
  `;
    return sendEmail(to, "Low Stock Alert", html);
}
//# sourceMappingURL=email.js.map