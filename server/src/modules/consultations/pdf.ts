import PDFDocument from "pdfkit";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export async function generateCertificatePdf(consultationId: string, organizationId: string, opts: { days?: number; type?: "sick" | "fitness" }): Promise<Buffer> {
  const consultation = await prisma.consultation.findFirst({
    where: { id: consultationId },
    include: {
      appointment: {
        include: {
          patient: { select: { id: true, patientId: true, name: true, phone: true, gender: true, age: true, dob: true } },
          doctor: { select: { id: true, name: true, organizationId: true } },
        },
      },
      doctor: { select: { id: true, name: true } },
    },
  });

  if (!consultation) throw AppError.notFound("Consultation not found");
  const appointment = consultation.appointment;
  if (!appointment || appointment.doctor.organizationId !== organizationId) {
    throw AppError.forbidden("Not authorized to access this consultation");
  }

  const org = await prisma.organization.findUnique({ where: { id: organizationId } });

  const type = opts.type === "fitness" ? "FITNESS" : "SICK";
  const title = type === "FITNESS" ? "FITNESS CERTIFICATE" : "SICK CERTIFICATE";
  const days = opts.days && opts.days > 0 ? opts.days : 1;
  const today = new Date();
  const validFrom = today.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 60 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text(org?.name || "Hospital", { align: "center" });
    if (org?.address) doc.fontSize(9).font("Helvetica").text(org.address, { align: "center" });
    if (org?.phone) doc.fontSize(9).text(`Phone: ${org.phone}`, { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(0.6);

    doc.fontSize(16).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(0.8);

    doc.fontSize(10).font("Helvetica");
    doc.text(`This is to certify that patient `, { continued: true });
    doc.font("Helvetica-Bold").text(`${appointment.patient.name}`);
    doc.font("Helvetica");
    doc.text(`(Patient ID: ${appointment.patient.patientId})`, { indent: 60 });

    if (appointment.patient.dob) {
      doc.text(`Date of Birth: ${new Date(appointment.patient.dob).toLocaleDateString("en-IN")}`);
    }
    if (appointment.patient.gender) doc.text(`Gender: ${appointment.patient.gender}`);

    const doctor = appointment.doctor || consultation.doctor;
    doc.moveDown(0.5);
    doc.text(`was examined by ${doctor?.name ? `Dr. ${doctor.name}` : "the attending physician"} `, { continued: true });
    doc.text(`on ${validFrom}.`);

    if (consultation.diagnosis) {
      doc.moveDown(0.5);
      doc.text(`Diagnosis: ${consultation.diagnosis}`);
    }

    doc.moveDown(0.8);
    if (type === "FITNESS") {
      doc.text(`The patient is certified FIT and able to resume normal duties as of ${validFrom}.`);
    } else {
      doc.text(`The patient is advised ${days} day${days > 1 ? "s" : ""} of rest, from ${validFrom}.`);
    }

    doc.moveDown(1.2);
    doc.text("Consulting Physician", { align: "right" });
    doc.moveDown(0.3);
    doc.font("Helvetica-Bold").text(`Dr. ${doctor?.name || ""}`, { align: "right" });
    doc.moveDown(1);
    doc.moveTo(60, doc.y).lineTo(535, doc.y).stroke();
    doc.moveDown(0.3);
    doc.fontSize(8).font("Helvetica").text(`Generated on ${today.toLocaleString("en-IN")}`, { align: "center" });

    doc.end();
  });
}
