import cron from "node-cron";
import { logger } from "../common/logger";
const jobs = [];
export function startCronJobs() {
    const backupJob = cron.schedule("0 2 * * *", async () => {
        logger.info("Running night backup job");
        try {
            const { runBackup } = await import("./jobs/backup");
            await runBackup();
        }
        catch (err) {
            logger.error({ err }, "Backup job failed");
        }
    }, { timezone: "Asia/Kolkata" });
    jobs.push(backupJob);
    const reminderJob = cron.schedule("0 8 * * *", async () => {
        logger.info("Running appointment reminder job");
        try {
            const { runAppointmentReminders } = await import("./jobs/appointment-reminder");
            await runAppointmentReminders();
        }
        catch (err) {
            logger.error({ err }, "Appointment reminder job failed");
        }
    }, { timezone: "Asia/Kolkata" });
    jobs.push(reminderJob);
    const expiryJob = cron.schedule("0 9 * * 1", async () => {
        logger.info("Running medicine expiry check job");
        try {
            const { runMedicineExpiryCheck } = await import("./jobs/medicine-expiry");
            await runMedicineExpiryCheck();
        }
        catch (err) {
            logger.error({ err }, "Medicine expiry job failed");
        }
    }, { timezone: "Asia/Kolkata" });
    jobs.push(expiryJob);
    const renewalJob = cron.schedule("0 7 * * *", async () => {
        logger.info("Running subscription renewal check job");
        try {
            const { runSubscriptionRenewalCheck } = await import("./jobs/subscription-renewal");
            await runSubscriptionRenewalCheck();
        }
        catch (err) {
            logger.error({ err }, "Subscription renewal job failed");
        }
    }, { timezone: "Asia/Kolkata" });
    jobs.push(renewalJob);
    logger.info({ jobCount: jobs.length }, "Cron jobs started");
}
export function stopCronJobs() {
    jobs.forEach((job) => job.stop());
    logger.info("All cron jobs stopped");
}
//# sourceMappingURL=index.js.map