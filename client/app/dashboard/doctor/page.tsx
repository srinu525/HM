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
import { History } from "lucide-react";

interface QueueItem {
  id: string;
  token: number;
  status: string;
  notes: string | null;
  patient: {
    id: string;
    name: string;
    phone: string | null;
    gender: string;
    dob: string;
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

export default function DoctorPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<QueueItem | null>(null);
  const [consultationDialogOpen, setConsultationDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [consultationForm, setConsultationForm] = useState({
    diagnosis: "",
    notes: "",
    prescriptionNotes: "",
  });

  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [treatmentHistory, setTreatmentHistory] = useState<HistoryVisit[]>([]);

  const fetchQueue = async () => {
    try {
      if (!user) return;
      const res = await api.get(`/appointments/queue/${user.id}`);
      setQueue(res.data);
    } catch {}
  };

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [qRes, mRes] = await Promise.all([
        api.get(`/appointments/queue/${user.id}`),
        api.get("/pharmacy/medicines"),
      ]);
      setQueue(qRes.data);
      setMedicines(mRes.data);
    }
    load();
  }, [user]);

  const startConsultation = async (item: QueueItem) => {
    setSelectedAppointment(item);
    setConsultationForm({ diagnosis: "", notes: "", prescriptionNotes: "" });
    setPrescriptionItems([{ medicineId: "", dosage: "", duration: "", instructions: "", quantity: 1 }]);
    setConsultationDialogOpen(true);
    try {
      const res = await consultationApi.getByPatient(item.patient.id);
      setTreatmentHistory(res.data);
    } catch {
      setTreatmentHistory([]);
    }
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
          items: validItems,
        });
      }

      setMessage("Consultation completed successfully!");
      setConsultationDialogOpen(false);
      setSelectedAppointment(null);
      fetchQueue();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to complete consultation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Doctor Consultation</h1>
        <p className="text-gray-500">Patient queue for today</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Queue ({queue.length} patients)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queue.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No patients in queue</p>
            ) : (
              queue.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">#{item.token}</p>
                    </div>
                    <div>
                      <p className="font-medium">{item.patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.patient.gender} | DOB:{" "}
                        {new Date(item.patient.dob).toLocaleDateString()}
                        {item.patient.phone && ` | ${item.patient.phone}`}
                      </p>
                      {item.notes && (
                        <p className="text-sm text-gray-400 italic">Note: {item.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        item.status === "IN_PROGRESS" ? "default" : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => startConsultation(item)}
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

      <Dialog open={consultationDialogOpen} onOpenChange={setConsultationDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Consultation - #{selectedAppointment?.token} {selectedAppointment?.patient.name}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleConsultation} className="space-y-4">
            {treatmentHistory.length > 0 && (
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <History className="h-4 w-4" />
                  Treatment History ({treatmentHistory.length} previous visits)
                </p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {treatmentHistory.map((visit) => (
                    <div key={visit.id} className="p-2 border rounded bg-white text-sm">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">
                          Visit #{visit.appointment.token} — {new Date(visit.appointment.date).toLocaleDateString()}
                        </p>
                        <span className="text-xs text-gray-500">Dr. {visit.doctor.name}</span>
                      </div>
                      {visit.diagnosis && (
                        <p className="text-gray-700 mt-1"><span className="font-medium">Diagnosis:</span> {visit.diagnosis}</p>
                      )}
                      {visit.notes && (
                        <p className="text-gray-500 text-xs mt-1">{visit.notes}</p>
                      )}
                      {visit.prescriptions.length > 0 && (
                        <div className="mt-1">
                          {visit.prescriptions.map((rx, i) => (
                            <p key={i} className="text-xs text-gray-600">
                              Medicines: {rx.items.map((itm) => `${itm.medicine.name} (${itm.dosage}, ${itm.duration})`).join(", ")}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                          updatePrescriptionItem(index, "quantity", String(Math.max(1, parseInt(e.target.value) || 1)))
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
