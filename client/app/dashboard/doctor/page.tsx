"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { api, consultationApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { History, Printer, ArrowLeft, CheckCircle } from "lucide-react";

interface QueueItem {
  id: string;
  token: number;
  status: string;
  notes: string | null;
  validUntil: string | null;
  patient: {
    id: string;
    patientId: string;
    name: string;
    phone: string | null;
    gender: string;
    dob: string;
  };
}

interface TodayAppointment {
  id: string;
  token: number;
  status: string;
  date: string;
  patient: {
    id: string;
    patientId: string;
    name: string;
    phone: string | null;
    gender: string;
  };
}

interface Medicine {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface PrescriptionItem {
  medicineId: string;
  dosage: string;
  duration: string;
  instructions: string;
  quantity: number;
}

interface HistoryVisit {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  createdAt: string;
  appointment: { date: string; token: number };
  doctor: { name: string };
  prescriptions: {
    notes: string | null;
    items: { dosage: string; duration: string; instructions: string | null; medicine: { name: string } }[];
  }[];
}

interface CompletedConsultation {
  id: string;
  diagnosis: string | null;
  notes: string | null;
  createdAt: string;
  appointment: {
    token: number;
    date: string;
    patient: { id: string; patientId: string; name: string; phone: string | null; gender: string; dob: string };
  };
  prescriptions: {
    id: string;
    notes: string | null;
    items: {
      dosage: string;
      duration: string;
      instructions: string | null;
      quantity: number;
      medicine: { id: string; name: string };
    }[];
  }[];
}

interface PrescriptionPrintData {
  patient: { patientId: string; name: string; phone: string | null; gender: string; dob: string };
  token: number;
  date: string;
  doctorName: string;
  diagnosis: string;
  notes: string;
  prescriptionNotes: string;
  items: { medicineName: string; dosage: string; duration: string; instructions: string; quantity: number }[];
}

export default function DoctorPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [completedConsultations, setCompletedConsultations] = useState<CompletedConsultation[]>([]);

  const [consultationForm, setConsultationForm] = useState({
    diagnosis: "",
    notes: "",
    prescriptionNotes: "",
  });

  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [treatmentHistory, setTreatmentHistory] = useState<HistoryVisit[]>([]);
  const [printPrescription, setPrintPrescription] = useState<PrescriptionPrintData | null>(null);

  const fetchQueue = async () => {
    try {
      if (!user) return;
      const res = await api.get(`/appointments/queue/${user.id}`);
      setQueue(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchCompleted = async () => {
    try {
      const res = await consultationApi.getTodayCompleted();
      setCompletedConsultations(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [qRes, mRes, aRes] = await Promise.all([
        api.get(`/appointments/queue/${user.id}`),
        api.get("/pharmacy/medicines"),
        api.get(`/appointments/doctor/${user.id}`),
      ]);
      setQueue(qRes.data);
      setMedicines(mRes.data);
      setTodayAppointments(aRes.data);
      fetchCompleted();
    }
    load();
  }, [user]);

  const startConsultation = async (item: QueueItem) => {
    setSelectedAppointment(item);
    setConsultationForm({ diagnosis: "", notes: "", prescriptionNotes: "" });
    setPrescriptionItems([{ medicineId: "", dosage: "", duration: "", instructions: "", quantity: 1 }]);
    try {
      const res = await consultationApi.getByPatient(item.patient.id);
      setTreatmentHistory(res.data);
    } catch {
      setTreatmentHistory([]);
    }
  };

  const cancelConsultation = () => {
    setSelectedAppointment(null);
    setTreatmentHistory([]);
  };

  const addPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicineId: "", dosage: "", duration: "", instructions: "", quantity: 1 },
    ]);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: string | number) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrescriptionItems(updated);
  };

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !user) return;
    setLoading(true);
    setMessage("");

    try {
      const consultRes = await api.post("/consultations", {
        appointmentId: selectedAppointment.id,
        diagnosis: consultationForm.diagnosis,
        notes: consultationForm.notes,
      });

      const validItems = prescriptionItems.filter((item) => item.medicineId);
      if (validItems.length > 0) {
        await api.post("/pharmacy/prescriptions", {
          patientId: selectedAppointment.patient.id,
          consultationId: consultRes.data.id,
          notes: consultationForm.prescriptionNotes,
          items: validItems.map((item) => ({
            ...item,
            quantity: Number(item.quantity) || 1,
          })),
        });
      }

      setMessage("Consultation completed successfully!");

      const medicineNames = validItems.map((item) => {
        const med = medicines.find((m) => m.id === item.medicineId);
        return {
          medicineName: med?.name || "Unknown",
          dosage: item.dosage,
          duration: item.duration,
          instructions: item.instructions,
          quantity: Number(item.quantity) || 1,
        };
      });

      setPrintPrescription({
        patient: selectedAppointment.patient,
        token: selectedAppointment.token,
        date: new Date().toISOString(),
        doctorName: user.name,
        diagnosis: consultationForm.diagnosis,
        notes: consultationForm.notes,
        prescriptionNotes: consultationForm.prescriptionNotes,
        items: medicineNames,
      });

      setSelectedAppointment(null);
      setTreatmentHistory([]);
      fetchQueue();
      fetchCompleted();
      const aRes = await api.get(`/appointments/doctor/${user.id}`);
      setTodayAppointments(aRes.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to complete consultation");
    } finally {
      setLoading(false);
    }
  };

  const openPrintForCompleted = (c: CompletedConsultation) => {
    const rx = c.prescriptions[0];
    setPrintPrescription({
      patient: c.appointment.patient,
      token: c.appointment.token,
      date: c.createdAt,
      doctorName: user?.name || "",
      diagnosis: c.diagnosis || "",
      notes: c.notes || "",
      prescriptionNotes: rx?.notes || "",
      items: rx
        ? rx.items.map((itm) => ({
            medicineName: itm.medicine.name,
            dosage: itm.dosage,
            duration: itm.duration,
            instructions: itm.instructions || "",
            quantity: itm.quantity,
          }))
        : [],
    });
  };

  const completedToday = todayAppointments.filter((a) => a.status === "COMPLETED").length;
  const pendingToday = todayAppointments.length - completedToday;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Consultation</h1>
          <p className="text-gray-600 mt-1">Patient queue for today</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-center min-w-20">
            <p className="text-xs text-gray-500 font-medium">Total</p>
            <p className="text-xl font-bold text-gray-900">{todayAppointments.length}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-center min-w-20">
            <p className="text-xs text-gray-500 font-medium">Done</p>
            <p className="text-xl font-bold text-green-600">{completedToday}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-center min-w-20">
            <p className="text-xs text-gray-500 font-medium">Pending</p>
            <p className="text-xl font-bold text-orange-600">{pendingToday}</p>
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {selectedAppointment ? (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="ghost" size="sm" onClick={cancelConsultation}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Queue
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Consultation — #{selectedAppointment.token} {selectedAppointment.patient.name} <span className="text-sm text-gray-400">{selectedAppointment.patient.patientId}</span>
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedAppointment.patient.gender} | DOB: {new Date(selectedAppointment.patient.dob).toLocaleDateString()}
                  {selectedAppointment.patient.phone && ` | ${selectedAppointment.patient.phone}`}
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleConsultation} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Input
                      value={consultationForm.diagnosis}
                      onChange={(e) =>
                        setConsultationForm({ ...consultationForm, diagnosis: e.target.value })
                      }
                      placeholder="Enter diagnosis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Notes</Label>
                    <Input
                      value={consultationForm.notes}
                      onChange={(e) =>
                        setConsultationForm({ ...consultationForm, notes: e.target.value })
                      }
                      placeholder="Clinical notes"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-semibold">Prescription</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addPrescriptionItem}>
                        + Add Medicine
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {prescriptionItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-end p-3 border rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-xs">Medicine</Label>
                            <select
                              className="w-full border rounded px-2 py-1.5 text-sm"
                              value={item.medicineId}
                              onChange={(e) => updatePrescriptionItem(index, "medicineId", e.target.value)}
                            >
                              <option value="">Select...</option>
                              {medicines.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updatePrescriptionItem(index, "quantity", Math.max(1, parseInt(e.target.value) || 1))
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Dosage</Label>
                            <Input
                              value={item.dosage}
                              onChange={(e) => updatePrescriptionItem(index, "dosage", e.target.value)}
                              placeholder="e.g. 1 tablet"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Duration</Label>
                            <Input
                              value={item.duration}
                              onChange={(e) => updatePrescriptionItem(index, "duration", e.target.value)}
                              placeholder="e.g. 5 days"
                            />
                          </div>
                          <div className="flex gap-1">
                            <div className="space-y-1 flex-1">
                              <Label className="text-xs">Instructions</Label>
                              <Input
                                value={item.instructions}
                                onChange={(e) =>
                                  updatePrescriptionItem(index, "instructions", e.target.value)
                                }
                                placeholder="e.g. After food"
                              />
                            </div>
                            {prescriptionItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 mt-4"
                                onClick={() => removePrescriptionItem(index)}
                              >
                                x
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Prescription Notes</Label>
                    <Input
                      value={consultationForm.prescriptionNotes}
                      onChange={(e) =>
                        setConsultationForm({ ...consultationForm, prescriptionNotes: e.target.value })
                      }
                      placeholder="General instructions for patient"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Saving..." : "Complete Consultation"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="w-[380px] shrink-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="shrink-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4" />
                  Treatment History
                  {treatmentHistory.length > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {treatmentHistory.length} visits
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto min-h-0 max-h-[calc(100vh-220px)]">
                {treatmentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No previous visits</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {treatmentHistory.map((visit) => (
                      <div key={visit.id} className="p-3 border rounded-lg bg-gray-50 text-sm">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">
                            Visit #{visit.appointment.token}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(visit.appointment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Dr. {visit.doctor.name}</p>
                        {visit.diagnosis && (
                          <p className="text-gray-700 mt-2">
                            <span className="font-medium">Diagnosis:</span> {visit.diagnosis}
                          </p>
                        )}
                        {visit.notes && (
                          <p className="text-gray-500 text-xs mt-1 italic">{visit.notes}</p>
                        )}
                        {visit.prescriptions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {visit.prescriptions.map((rx, i) => (
                              <div key={i} className="text-xs text-gray-600 bg-white p-2 rounded border">
                                {rx.items.map((itm, j) => (
                                  <p key={j}>
                                    {itm.medicine.name} — {itm.dosage}, {itm.duration}
                                    {itm.instructions && <span className="text-gray-400"> ({itm.instructions})</span>}
                                  </p>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Today&rsquo;s Queue ({queue.length} patients)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queue.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No patients in queue</p>
                    <p className="text-sm text-gray-400 mt-1">New appointments will appear here</p>
                  </div>
                ) : (
                  queue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-linear-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center shrink-0">
                          <p className="text-xl font-bold text-blue-600">#{item.token}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{item.patient.name} <span className="text-sm text-gray-400">{item.patient.patientId}</span></p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.patient.gender} | DOB:{" "}
                            {new Date(item.patient.dob).toLocaleDateString()}
                            {item.patient.phone && ` | ${item.patient.phone}`}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-400 italic mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {item.notes}
                            </p>
                          )}
                          {item.validUntil && (
                            <p className="text-xs text-orange-500 mt-1">
                              Valid until: {new Date(item.validUntil).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            item.status === "IN_PROGRESS" ? "default" : "secondary"
                          }
                          className="px-3 py-1"
                        >
                          {item.status}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => startConsultation(item)}
                          className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        >
                          Consult
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {completedConsultations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Completed Today ({completedConsultations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedConsultations.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                          <p className="text-lg font-bold text-green-600">#{c.appointment.token}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{c.appointment.patient.name} <span className="text-sm text-gray-400">{c.appointment.patient.patientId}</span></p>
                          <p className="text-sm text-gray-500">
                            {c.appointment.patient.gender} | {new Date(c.createdAt).toLocaleTimeString()}
                          </p>
                          {c.diagnosis && (
                            <p className="text-xs text-gray-600 mt-0.5">Diagnosis: {c.diagnosis}</p>
                          )}
                          {c.prescriptions.length > 0 && c.prescriptions[0].items.length > 0 && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {c.prescriptions[0].items.map((itm) => itm.medicine.name).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openPrintForCompleted(c)}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {printPrescription && (
        <Dialog open={!!printPrescription} onOpenChange={() => setPrintPrescription(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Print Prescription
              </DialogTitle>
            </DialogHeader>
            <div id="prescription-print" className="space-y-4 p-4 border rounded-lg bg-white">
              <div className="text-center border-b pb-3">
                <h2 className="text-xl font-bold text-blue-600">HM System</h2>
                <p className="text-sm text-gray-500">Hospital Management</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Patient: <span className="font-normal">{printPrescription.patient.name}</span></p>
                  <p className="font-medium text-gray-700">ID: <span className="font-normal">{printPrescription.patient.patientId}</span></p>
                  <p className="font-medium text-gray-700">Phone: <span className="font-normal">{printPrescription.patient.phone || "N/A"}</span></p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-700">Token: <span className="font-normal">#{printPrescription.token}</span></p>
                  <p className="font-medium text-gray-700">Date: <span className="font-normal">{new Date(printPrescription.date).toLocaleDateString()}</span></p>
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-700">Doctor: <span className="font-normal">{printPrescription.doctorName}</span></p>
              </div>
              {printPrescription.diagnosis && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Diagnosis:</p>
                  <p className="text-gray-600">{printPrescription.diagnosis}</p>
                </div>
              )}
              {printPrescription.notes && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700">Notes:</p>
                  <p className="text-gray-600">{printPrescription.notes}</p>
                </div>
              )}
              {printPrescription.items.length > 0 && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700 mb-2">Prescription:</p>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1 text-left text-xs">Medicine</th>
                        <th className="border px-2 py-1 text-center text-xs">Qty</th>
                        <th className="border px-2 py-1 text-left text-xs">Dosage</th>
                        <th className="border px-2 py-1 text-left text-xs">Duration</th>
                        <th className="border px-2 py-1 text-left text-xs">Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printPrescription.items.map((item, i) => (
                        <tr key={i}>
                          <td className="border px-2 py-1">{item.medicineName}</td>
                          <td className="border px-2 py-1 text-center">{item.quantity}</td>
                          <td className="border px-2 py-1">{item.dosage}</td>
                          <td className="border px-2 py-1">{item.duration}</td>
                          <td className="border px-2 py-1">{item.instructions || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {printPrescription.prescriptionNotes && (
                <div className="text-sm">
                  <p className="font-medium text-gray-700">General Instructions:</p>
                  <p className="text-gray-600">{printPrescription.prescriptionNotes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPrintPrescription(null)}
              >
                Close
              </Button>
              <Button
                className="flex-1 bg-linear-to-r from-blue-600 to-cyan-600"
                onClick={() => {
                  const printContent = document.getElementById("prescription-print");
                  if (!printContent) return;
                  const win = window.open("", "_blank");
                  if (!win) return;
                  win.document.write(`
                    <html><head><title>Prescription</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 20px; }
                      table { width: 100%; border-collapse: collapse; }
                      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; font-size: 13px; }
                      th { background: #f3f4f6; }
                      .text-center { text-align: center; }
                    </style></head><body>
                    ${printContent.innerHTML}
                    </body></html>
                  `);
                  win.document.close();
                  win.print();
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
