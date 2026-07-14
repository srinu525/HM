import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface SaleItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SaleData {
  id: string;
  patientName: string;
  patientId?: string;
  patientPhone?: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
}

export function generateInvoice(sale: SaleData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("HOSPITAL MANAGEMENT SYSTEM", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Invoice / Bill", pageWidth / 2, 28, { align: "center" });

  // Invoice details
  doc.setFontSize(10);
  doc.text(`Invoice ID: ${sale.id}`, 14, 40);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleString("en-IN")}`, 14, 46);
  doc.text(`Patient: ${sale.patientName}`, 14, 52);
  if (sale.patientId) {
    doc.text(`Patient ID: ${sale.patientId}`, 14, 58);
  }
  if (sale.patientPhone) {
    doc.text(`Phone: ${sale.patientPhone}`, 14, sale.patientId ? 64 : 58);
  }

  // Items table
  const tableData = sale.items.map((item) => [
    item.medicineName,
    item.quantity.toString(),
    `₹${item.unitPrice.toFixed(2)}`,
    `₹${item.total.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: sale.patientId ? (sale.patientPhone ? 70 : 64) : (sale.patientPhone ? 64 : 58),
    head: [["Medicine", "Qty", "Unit Price", "Total"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ₹${sale.total.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your visit!", pageWidth / 2, 280, { align: "center" });

  doc.save(`invoice-${sale.id}.pdf`);
}

export function generatePrescription(data: {
  patientName: string;
  patientId?: string;
  patientAge?: string;
  patientGender?: string;
  diagnosis?: string;
  notes?: string;
  prescriptionNotes?: string;
  items: Array<{
    medicineName: string;
    dosage: string;
    duration: string;
    instructions?: string;
    quantity: number;
  }>;
  doctorName: string;
  date: string;
}) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("HOSPITAL MANAGEMENT SYSTEM", 105, 20, { align: "center" });

  doc.setFontSize(14);
  doc.text("Prescription", 105, 28, { align: "center" });

  // Patient details
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Patient: ${data.patientName}`, 14, 42);
  if (data.patientId) doc.text(`ID: ${data.patientId}`, 14, 48);
  if (data.patientAge) doc.text(`Age: ${data.patientAge}`, 14, data.patientId ? 54 : 48);
  if (data.patientGender) doc.text(`Gender: ${data.patientGender}`, 14, data.patientId ? 60 : 54);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString("en-IN")}`, 14, data.patientId ? 66 : 60);
  doc.text(`Doctor: ${data.doctorName}`, 14, data.patientId ? 72 : 66);

  // Diagnosis
  if (data.diagnosis) {
    doc.setFont("helvetica", "bold");
    doc.text("Diagnosis:", 14, data.patientId ? 84 : 78);
    doc.setFont("helvetica", "normal");
    doc.text(data.diagnosis, 14, data.patientId ? 90 : 84, { maxWidth: 182 });
  }

  // Medicines table
  const startY = data.diagnosis ? (data.patientId ? 96 : 90) : (data.patientId ? 84 : 78);
  doc.setFont("helvetica", "bold");
  doc.text("Medicines:", 14, startY);

  const tableData = data.items.map((item) => [
    item.medicineName,
    item.dosage,
    item.duration,
    item.instructions || "-",
    item.quantity.toString(),
  ]);

  autoTable(doc, {
    startY: startY + 4,
    head: [["Medicine", "Dosage", "Duration", "Instructions", "Qty"]],
    body: tableData,
    theme: "grid",
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  // Notes
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  if (data.prescriptionNotes) {
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, finalY);
    doc.setFont("helvetica", "normal");
    doc.text(data.prescriptionNotes, 14, finalY + 6, { maxWidth: 182 });
  }

  // Footer
  doc.setFontSize(9);
  doc.text("This prescription is valid for 30 days from the date of issue.", 105, 280, { align: "center" });

  doc.save(`prescription-${data.patientName}-${Date.now()}.pdf`);
}