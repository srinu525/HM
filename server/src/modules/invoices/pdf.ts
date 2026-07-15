import PDFDocument from "pdfkit";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export async function generateInvoicePdf(invoiceId: string, organizationId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      items: true,
      patient: { select: { name: true, patientId: true, phone: true, email: true, address: true } },
      organization: { select: { name: true, address: true, phone: true, email: true } },
    },
  });
  if (!invoice) throw AppError.notFound("Invoice not found");

  const org = invoice.organization;
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).font("Helvetica-Bold").text(org.name || "Hospital", { align: "center" });
    if (org.address) doc.fontSize(9).font("Helvetica").text(org.address, { align: "center" });
    if (org.phone || org.email) doc.text(`${org.phone || ""} ${org.email ? "| " + org.email : ""}`, { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(24).font("Helvetica-Bold").text("INVOICE", { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica");
    doc.text(`Invoice #: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`);
    if (invoice.dueDate) doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}`);
    doc.text(`Status: ${invoice.status}`);
    doc.moveDown(0.5);

    if (invoice.patient) {
      doc.font("Helvetica-Bold").text("Bill To:");
      doc.font("Helvetica").text(invoice.patient.name);
      if (invoice.patient.patientId) doc.text(`ID: ${invoice.patient.patientId}`);
      if (invoice.patient.phone) doc.text(`Phone: ${invoice.patient.phone}`);
      if (invoice.patient.address) doc.text(invoice.patient.address);
      doc.moveDown(0.5);
    }

    if (invoice.description) {
      doc.font("Helvetica-Bold").text("Description:");
      doc.font("Helvetica").text(invoice.description);
      doc.moveDown(0.5);
    }

    const tableTop = doc.y;
    const colDesc = 50;
    const colQty = 300;
    const colPrice = 360;
    const colTotal = 440;

    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Item", colDesc, tableTop);
    doc.text("Qty", colQty, tableTop, { width: 50, align: "right" });
    doc.text("Price", colPrice, tableTop, { width: 70, align: "right" });
    doc.text("Total", colTotal, tableTop, { width: 70, align: "right" });

    doc.moveTo(50, tableTop + 14).lineTo(515, tableTop + 14).stroke();
    doc.font("Helvetica").fontSize(9);

    let y = tableTop + 22;
    for (const item of invoice.items) {
      doc.text(item.description, colDesc, y, { width: 240 });
      doc.text(String(item.quantity), colQty, y, { width: 50, align: "right" });
      doc.text(`₹${item.unitPrice.toFixed(2)}`, colPrice, y, { width: 70, align: "right" });
      doc.text(`₹${item.total.toFixed(2)}`, colTotal, y, { width: 70, align: "right" });
      y += 18;
    }

    doc.moveTo(50, y).lineTo(515, y).stroke();
    y += 10;

    doc.font("Helvetica-Bold");
    doc.text("Subtotal:", 360, y, { width: 70, align: "right" });
    doc.text(`₹${invoice.amount.toFixed(2)}`, colTotal, y, { width: 70, align: "right" });
    y += 16;

    if (invoice.tax > 0) {
      doc.font("Helvetica");
      doc.text("Tax:", 360, y, { width: 70, align: "right" });
      doc.text(`₹${invoice.tax.toFixed(2)}`, colTotal, y, { width: 70, align: "right" });
      y += 16;
    }

    doc.font("Helvetica-Bold").fontSize(11);
    doc.text("Total:", 340, y, { width: 90, align: "right" });
    doc.text(`₹${invoice.total.toFixed(2)}`, colTotal, y, { width: 70, align: "right" });

    doc.fontSize(8).font("Helvetica").fillColor("gray");
    doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, 50, doc.page.height - 50, { align: "center" });

    doc.end();
  });
}
