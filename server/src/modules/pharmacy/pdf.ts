import PDFDocument from "pdfkit";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export async function generatePrescriptionPdf(prescriptionId: string, organizationId: string): Promise<Buffer> {
  const prescription = await prisma.prescription.findFirst({
    where: { id: prescriptionId },
    include: {
      items: { include: { medicine: { select: { id: true, name: true, price: true } } } },
      patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, age: true, dob: true } },
      consultation: {
        include: {
          doctor: { select: { id: true, name: true, email: true } },
          appointment: { select: { token: true, date: true } },
        },
      },
    },
  });

  if (!prescription) throw AppError.notFound("Prescription not found");

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text(org?.name || "Hospital", { align: "center" });
    if (org?.address) doc.fontSize(9).font("Helvetica").text(org.address, { align: "center" });
    if (org?.phone) doc.fontSize(9).text(`Phone: ${org.phone}`, { align: "center" });
    if (org?.email) doc.fontSize(9).text(`Email: ${org.email}`, { align: "center" });

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Title
    doc.fontSize(14).font("Helvetica-Bold").text("PRESCRIPTION", { align: "center" });
    doc.moveDown(0.5);

    // Patient info
    const patient = prescription.patient;
    const doctor = prescription.consultation?.doctor;
    const appointment = prescription.consultation?.appointment;

    doc.fontSize(10).font("Helvetica-Bold").text("Patient Details", { underline: true });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(10);
    doc.text(`Name: ${patient.name}`);
    doc.text(`Patient ID: ${patient.patientId}`);
    if (patient.phone) doc.text(`Phone: ${patient.phone}`);
    if (patient.gender) doc.text(`Gender: ${patient.gender}`);
    if (patient.age) doc.text(`Age: ${patient.age} years`);
    if (patient.dob) doc.text(`DOB: ${new Date(patient.dob).toLocaleDateString("en-IN")}`);
    doc.moveDown(0.5);

    // Doctor info
    doc.font("Helvetica-Bold").text("Prescribed By", { underline: true });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(10);
    if (doctor) doc.text(`Dr. ${doctor.name}`);
    if (appointment?.date) doc.text(`Date: ${new Date(appointment.date).toLocaleDateString("en-IN")}`);
    if (appointment?.token) doc.text(`Token: #${appointment.token}`);
    doc.moveDown(0.5);

    // Medicines table
    doc.font("Helvetica-Bold").text("Medications", { underline: true });
    doc.moveDown(0.3);

    // Table header
    const tableTop = doc.y;
    const colMedicine = 50;
    const colDosage = 250;
    const colDuration = 350;
    const colQty = 470;

    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Medicine", colMedicine, tableTop);
    doc.text("Dosage", colDosage, tableTop);
    doc.text("Duration", colDuration, tableTop);
    doc.text("Qty", colQty, tableTop);

    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).stroke();
    doc.moveDown(0.3);

    // Table rows
    doc.font("Helvetica").fontSize(9);
    for (const item of prescription.items) {
      const y = doc.y;
      doc.text(item.medicine.name, colMedicine, y, { width: 190 });
      doc.text(item.dosage, colDosage, y, { width: 90 });
      doc.text(item.duration, colDuration, y, { width: 110 });
      doc.text(String(item.quantity || 1), colQty, y, { width: 50 });
      if (item.instructions) {
        doc.fontSize(8).text(`  Note: ${item.instructions}`, colMedicine, doc.y + 2);
        doc.fontSize(9);
      }
      doc.moveDown(0.3);
    }

    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Notes
    if (prescription.notes) {
      doc.font("Helvetica-Bold").fontSize(10).text("Notes", { underline: true });
      doc.moveDown(0.2);
      doc.font("Helvetica").fontSize(10).text(prescription.notes);
      doc.moveDown(0.5);
    }

    // Footer
    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(8).font("Helvetica").text(`Generated on ${new Date().toLocaleString("en-IN")}`, { align: "center" });

    doc.end();
  });
}
