export declare function sendEmail(to: string, subject: string, html: string): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo | null>;
export declare function sendAppointmentReminder(to: string, patientName: string, doctorName: string, date: Date, token: number): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo | null>;
export declare function sendSubscriptionExpiry(to: string, orgName: string, planName: string, endDate: Date): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo | null>;
export declare function sendLowStockAlert(to: string, medicines: {
    name: string;
    stock: number;
}[]): Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo | null>;
//# sourceMappingURL=email.d.ts.map