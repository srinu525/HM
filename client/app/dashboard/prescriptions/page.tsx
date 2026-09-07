"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Printer, Download, Stethoscope } from "lucide-react";

interface Prescription {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  patient: { id: string; patientId: string; name: string; phone: string | null };
  consultation: {
    diagnosis: string | null;
    notes: string | null;
    doctor: { id: string; name: string };
    appointment: { token: number; date: string };
  };
  items: {
    id: string;
    dosage: string;
    duration: string;
    instructions: string | null;
    quantity: number;
    medicine: { id: string; name: string; price: number };
  }[];
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pharmacy/prescriptions");
      setPrescriptions(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handlePrintPrescription = (prescription: Prescription) => {
    const printContent = `
      <html><head><title>Prescription</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 700px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { color: #3b82f6; font-size: 24px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 13px; }
        th { background: #f3f4f6; }
        .info { margin: 10px 0; font-size: 14px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
      </style></head><body>
      <div class="header">
        <div class="logo">HM System</div>
        <p>Hospital Management - Prescription</p>
      </div>
      <div class="info">
        <p><strong>Patient:</strong> ${prescription.patient.name} (${prescription.patient.patientId})</p>
        <p><strong>Phone:</strong> ${prescription.patient.phone || "N/A"}</p>
        <p><strong>Doctor:</strong> Dr. ${prescription.consultation.doctor.name}</p>
        <p><strong>Date:</strong> ${new Date(prescription.createdAt).toLocaleDateString()}</p>
        <p><strong>Token:</strong> #${prescription.consultation.appointment.token}</p>
      </div>
      ${prescription.consultation.diagnosis ? `<p><strong>Diagnosis:</strong> ${prescription.consultation.diagnosis}</p>` : ""}
      ${prescription.consultation.notes ? `<p><strong>Notes:</strong> ${prescription.consultation.notes}</p>` : ""}
      <table>
        <thead>
          <tr><th>Medicine</th><th>Qty</th><th>Dosage</th><th>Duration</th><th>Instructions</th></tr>
        </thead>
        <tbody>
          ${prescription.items.map((item) => `
            <tr>
              <td>${item.medicine.name}</td>
              <td>${item.quantity}</td>
              <td>${item.dosage}</td>
              <td>${item.duration}</td>
              <td>${item.instructions || "-"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${prescription.notes ? `<p><strong>General Instructions:</strong> ${prescription.notes}</p>` : ""}
      <div class="footer">Thank you for visiting HM System</div>
      </body></html>
    `;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(printContent);
      win.document.close();
      win.print();
    }
  };

  const handleDownloadPdf = async (prescription: Prescription) => {
    try {
      const res = await api.get(`/pharmacy/prescriptions/${prescription.id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${prescription.patient.patientId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        <p className="text-gray-600 mt-1">View your prescriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prescriptions
            </span>
            <Badge variant="secondary">{prescriptions.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No prescriptions found</p>
              <p className="text-sm text-gray-400 mt-1">Prescriptions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{rx.patient.name}</p>
                          <span className="text-xs text-gray-400">{rx.patient.patientId}</span>
                          <Badge
                            className={
                              rx.status === "DISPENSED"
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {rx.status === "DISPENSED" ? "Dispensed" : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <Stethoscope className="h-3.5 w-3.5" />
                          Dr. {rx.consultation.doctor.name}
                          <span className="mx-1">|</span>
                          Token #{rx.consultation.appointment.token}
                        </div>
                        {rx.consultation.diagnosis && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Diagnosis:</span> {rx.consultation.diagnosis}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {rx.items.map((item) => (
                            <Badge key={item.id} variant="secondary" className="text-xs">
                              {item.medicine.name} - {item.dosage}, {item.duration}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(rx.createdAt).toLocaleDateString()} at{" "}
                          {new Date(rx.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPrescription(rx)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintPrescription(rx)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPdf(rx)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPrescription && (
        <Dialog open={!!selectedPrescription} onOpenChange={() => setSelectedPrescription(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Prescription Details
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Patient</p>
                  <p className="text-gray-900">{selectedPrescription.patient.name}</p>
                  <p className="text-gray-500 text-xs">{selectedPrescription.patient.patientId}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Doctor</p>
                  <p className="text-gray-900">Dr. {selectedPrescription.consultation.doctor.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Date</p>
                  <p className="text-gray-900">{new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Token</p>
                  <p className="text-gray-900">#{selectedPrescription.consultation.appointment.token}</p>
                </div>
              </div>

              {selectedPrescription.consultation.diagnosis && (
                <div>
                  <p className="font-medium text-gray-700 text-sm">Diagnosis</p>
                  <p className="text-gray-900">{selectedPrescription.consultation.diagnosis}</p>
                </div>
              )}

              <div>
                <p className="font-medium text-gray-700 text-sm mb-2">Medicines</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Medicine</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-left">Dosage</th>
                        <th className="px-3 py-2 text-left">Duration</th>
                        <th className="px-3 py-2 text-left">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-3 py-2 font-medium">{item.medicine.name}</td>
                          <td className="px-3 py-2 text-center">{item.quantity}</td>
                          <td className="px-3 py-2">{item.dosage}</td>
                          <td className="px-3 py-2">{item.duration}</td>
                          <td className="px-3 py-2 text-gray-500">{item.instructions || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPrescription.notes && (
                <div>
                  <p className="font-medium text-gray-700 text-sm">General Instructions</p>
                  <p className="text-gray-900">{selectedPrescription.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedPrescription(null)}
                >
                  Close
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handlePrintPrescription(selectedPrescription)}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}