"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarPlus,
  Users,
  Clock,
  Search,
  CheckCircle2,
  X,
  Printer,
  UserPlus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Activity,
  HeartPulse,
  TrendingUp,
  Stethoscope,
  AlertTriangle,
} from "lucide-react";

interface Patient {
  id: string;
  patientId: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string;
  age: number;
  dob: string | null;
  address: string | null;
}

interface Doctor {
  id: string;
  name: string;
}

interface QueueItem {
  id: string;
  token: number;
  status: string;
  date: string;
  consultationFee: number;
  vitals?: { weight?: string; height?: string; temperature?: string; bloodPressure?: string; oxygen?: string } | null;
  patient: { id: string; patientId: string; name: string; phone: string | null; gender: string; age: number; dob: string | null; address: string | null };
  doctor: { id: string; name: string };
}

type Tab = "book" | "queue" | "patients";

export default function ReceptionPage() {
  const [activeTab, setActiveTab] = useState<Tab>("book");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-gray-200">
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "book"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("book")}
        >
          <CalendarPlus className="h-4 w-4" /> Book Appointment
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "queue"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("queue")}
        >
          <Clock className="h-4 w-4" /> Today&apos;s Queue
        </button>
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "patients"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("patients")}
        >
          <Users className="h-4 w-4" /> Patients
        </button>
      </div>

      {activeTab === "book" && <BookAppointment />}
      {activeTab === "queue" && <QueueTab />}
      {activeTab === "patients" && <PatientsTab />}
    </div>
  );
}

const todayStr = () => new Date().toISOString().split("T")[0];

const printHtml = (html: string) => {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  if (!doc || !iframe.contentWindow) {
    iframe.remove();
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();
  const win = iframe.contentWindow;
  const doPrint = () => {
    win.focus();
    win.print();
    setTimeout(() => {
      iframe.remove();
    }, 1500);
  };
  if (doc.readyState === "complete") {
    setTimeout(doPrint, 100);
  } else {
    iframe.onload = doPrint;
  }
};

const esc = (s: string | number | null | undefined) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

const prescriptionPrintHtml = (data: {
  token: number;
  patient: { name: string; patientId?: string; phone?: string | null; gender?: string; age?: number; dob?: string | null; address?: string | null };
  doctorName: string;
  date?: string;
  vitals?: { weight?: string; height?: string; temperature?: string; bloodPressure?: string; oxygen?: string } | null;
}) => {
  const { token, patient, doctorName, vitals } = data;
  const apptDate = data.date ? new Date(data.date).toLocaleString() : new Date().toLocaleString();
  const v = vitals || {};
  const hasVitals = v.weight || v.height || v.temperature || v.bloodPressure || v.oxygen;
  const patientGender = patient.gender ? (patient.gender === "MALE" ? "Male" : patient.gender === "FEMALE" ? "Female" : "Other") : "";
  const ageElt = patient.age != null ? String(patient.age) : "";
  const dobElt = patient.dob ? patient.dob.slice(0, 10) : "";

  const field = (label: string, value: string) =>
    `<div class="pf"><span class="pl">${label}</span><span class="pv">${value || "&nbsp;"}</span></div>`;

  const vitalsRow = hasVitals
    ? `<tr class="vrow">
        <td>${v.weight ? field("Weight", `${v.weight} kg`) : ""}</td>
        <td>${v.height ? field("Height", `${v.height} cm`) : ""}</td>
        <td>${v.temperature ? field("Temp", `${v.temperature} C`) : ""}</td>
        <td>${v.bloodPressure ? field("BP", `${v.bloodPressure} mmHg`) : ""}</td>
        <td>${v.oxygen ? field("SpO2", `${v.oxygen}%`) : ""}</td>
      </tr>`
    : "";

  return `
<html><head><title>Prescription</title>
<style>
  @page { margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; background:#fff; margin:0; }
  .sheet { width: 8.27in; height: 11.69in; padding: 2in 0.55in 0.55in 0.55in; position: relative; }
  .sheet::before { content:""; position:absolute; top:1.4in; left:0.55in; right:0.55in; border-top:2px solid #333; }
  .header { text-align:center; margin-bottom:18px; }
  .header h1 { margin:0; font-size:22px; letter-spacing:1px; }
  .header .sub { color:#666; font-size:12px; margin-top:4px; }
  .meta { display:flex; justify-content:space-between; font-size:12px; color:#555; }
  .pf-grid { display:flex; flex-wrap:wrap; gap:6px 24px; }
  .ptable { border-collapse: collapse; width: 100%; }
  .ptable td { white-space: nowrap; padding: 7px 28px 7px 0; vertical-align: baseline; }
  .ptable td.pf-right { padding-right: 0; text-align: right; }
  .pf { display:inline-flex; align-items:baseline; gap:5px; white-space:nowrap; }
  .pl { color:#666; font-size:11px; } .pv { font-weight:600; font-size:12px; }
  .seg { margin-top:14px; }
  .seg-title { font-weight:bold; font-size:13px; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.5px; }
</style></head><body>
  <div class="sheet">
    <div class="header">
      <h1>HM HOSPITAL</h1>
      <div class="sub">Prescription - Token #${token}</div>
    </div>
    <div class="meta">
      <div class="pf"><span class="pl">Doctor</span><span class="pv">${esc(doctorName)}</span></div>
      <div class="pf"><span class="pl">Date</span><span class="pv">${esc(apptDate)}</span></div>
    </div>

    <div class="seg">
      <div class="seg-title">Patient Details</div>
      <table class="ptable">
        <tr>
          <td>${patient.patientId ? field("ID", esc(patient.patientId)) : ""}</td>
          <td colspan="2">${field("Name", esc(patient.name))}</td>
          <td colspan="2" class="pf-right">${field("Address", esc(patient.address))}</td>
        </tr>
        <tr>
          <td>${ageElt ? field("Age", ageElt) : ""}</td>
          <td>${patientGender ? field("Gender", patientGender) : ""}</td>
          <td>${dobElt ? field("DOB", dobElt) : ""}</td>
          <td>${field("Mobile", esc(patient.phone))}</td>
          <td></td>
        </tr>
        ${vitalsRow}
      </table>
    </div>
  </div>
</body></html>`;
};

function BookAppointment() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [booked, setBooked] = useState<{ token: number; appt: { date?: string; patient?: { name: string; patientId?: string; phone?: string | null; gender?: string; age?: number; dob?: string | null; address?: string | null }; doctor?: { name: string }; vitals?: { weight?: string; height?: string; temperature?: string; bloodPressure?: string; oxygen?: string } | null } } | null>(null);
  const [quickForm, setQuickForm] = useState({ name: "", phone: "", email: "", gender: "MALE", age: "", dob: "", address: "" });
  const [registering, setRegistering] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [conflictName, setConflictName] = useState("");
  const messageTimer = useRef<number | null>(null);

  const flashMessage = (text: string) => {
    if (messageTimer.current) window.clearTimeout(messageTimer.current);
    setMessage(text);
    messageTimer.current = window.setTimeout(() => {
      setMessage("");
      messageTimer.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (messageTimer.current) window.clearTimeout(messageTimer.current);
    };
  }, []);

  const [form, setForm] = useState({
    doctorId: "",
    notes: "",
    consultationFee: "",
    validUntil: "",
    date: todayStr(),
    weight: "",
    height: "",
    temperature: "",
    bloodPressure: "",
    oxygen: "",
  });

  useEffect(() => {
    async function load() {
      try {
        const [pRes, dRes] = await Promise.all([
          api.get("/patients"),
          api.get("/users/doctors"),
        ]);
        setPatients(pRes.data.data);
        setDoctors(dRes.data.data);
      } catch (error) {
        console.error(error);
      }
    }
    load();
  }, []);

  const fetchPatients = async (q?: string) => {
    try {
      const res = await api.get("/patients", { params: { search: q || undefined } });
      setPatients(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchPatients(value);
  };

  const fillQuickFromPatient = (p: Patient) => {
    let dob = p.dob ? p.dob.slice(0, 10) : "";
    let age = p.age ? String(p.age) : "";
    if (dob) {
      const birth = new Date(dob);
      const today = new Date();
      let a = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
      age = String(a);
    }
    setQuickForm({
      name: p.name || "",
      phone: p.phone || "",
      email: p.email || "",
      gender: p.gender || "MALE",
      age,
      dob,
      address: p.address || "",
    });
  };

  const resetForm = () => {
    setForm({
      doctorId: "",
      notes: "",
      consultationFee: "",
      validUntil: "",
      date: todayStr(),
      weight: "",
      height: "",
      temperature: "",
      bloodPressure: "",
      oxygen: "",
    });
    setSelectedPatient(null);
    setSearch("");
    setQuickForm({ name: "", phone: "", email: "", gender: "MALE", age: "", dob: "", address: "" });
  };

  const handleRegister = async () => {
    if (!quickForm.name || !quickForm.phone) {
      flashMessage("Fill patient name and phone to register");
      return;
    }
    setRegistering(true);
    setMessage("");
    try {
      const res = await api.post("/patients", {
        name: quickForm.name,
        phone: quickForm.phone,
        email: quickForm.email || null,
        gender: quickForm.gender,
        age: quickForm.age ? Number(quickForm.age) : 0,
        dob: quickForm.dob ? new Date(quickForm.dob).toISOString() : null,
        address: quickForm.address,
      });
      const created = res.data.data;
      setSelectedPatient(created);
      setPatients((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      fillQuickFromPatient(created);
      flashMessage(`Patient registered: ${created.name} (${created.patientId}). Now book the appointment.`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      flashMessage(error.response?.data?.message || "Failed to register patient");
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      flashMessage("Select or register a patient first");
      return;
    }
    if (!form.doctorId) {
      flashMessage("Please select a doctor");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const updates: Record<string, unknown> = {};
      if (quickForm.name && quickForm.name !== selectedPatient.name) updates.name = quickForm.name;
      if (quickForm.phone && quickForm.phone !== selectedPatient.phone) updates.phone = quickForm.phone;
      if (quickForm.email && quickForm.email !== selectedPatient.email) updates.email = quickForm.email;
      if (quickForm.gender && quickForm.gender !== selectedPatient.gender) updates.gender = quickForm.gender;
      if (quickForm.age && Number(quickForm.age) !== selectedPatient.age) updates.age = Number(quickForm.age);
      if (quickForm.dob && quickForm.dob !== (selectedPatient.dob ? selectedPatient.dob.slice(0, 10) : "")) updates.dob = new Date(quickForm.dob).toISOString();
      if (quickForm.address && quickForm.address !== selectedPatient.address) updates.address = quickForm.address;
      if (Object.keys(updates).length > 0) {
        await api.put(`/patients/${selectedPatient.id}`, updates);
      }
      const vitals = {
        weight: form.weight,
        height: form.height,
        temperature: form.temperature,
        bloodPressure: form.bloodPressure,
        oxygen: form.oxygen,
      };
      const res = await api.post("/appointments", {
        patientId: selectedPatient.id,
        doctorId: form.doctorId,
        notes: form.notes,
        consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : 0,
        validUntil: form.validUntil || undefined,
        date: form.date || undefined,
        vitals,
      });
      flashMessage(`Appointment booked! Token #${res.data.data.token}`);
      setBooked({ token: res.data.data.token, appt: res.data.data });
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const msg = error.response?.data?.message || "Failed to book appointment";
      if (msg.includes("already has an appointment")) {
        setConflictName(selectedPatient?.name || "this patient");
        setConflictOpen(true);
      } else {
        flashMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasVitals = form.weight || form.height || form.temperature || form.bloodPressure || form.oxygen;

  return (
    <>
      {message && (
        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${
          message.includes("Token") || message.includes("registered")
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
        }`}>
          {(message.includes("Token") || message.includes("registered")) && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}

      {booked && <TokenSlip token={booked.token} appt={booked.appt} onClose={() => setBooked(null)} />}

      <Dialog open={conflictOpen} onOpenChange={setConflictOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Already Has an Appointment
            </DialogTitle>
            <DialogDescription>
              <span className="font-medium">{conflictName}</span> already has an appointment booked for today. A patient cannot have more than one appointment per day.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search patient by name or phone..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="button" onClick={handleRegister} disabled={registering} className="shrink-0 whitespace-nowrap">
                  <UserPlus className="h-4 w-4 mr-1.5" />
                  {registering ? "Registering..." : "Register"}
                </Button>
              </div>

              {selectedPatient && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{selectedPatient.name}</p>
                    <p className="text-sm text-blue-700">
                      {selectedPatient.patientId} | {selectedPatient.phone} | {selectedPatient.gender}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {search.trim() && !selectedPatient && patients.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {patients.slice(0, 10).map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => { setSelectedPatient(patient); fillQuickFromPatient(patient); }}
                      className="w-full text-left p-3 rounded-lg border transition-colors border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">
                        {patient.name}
                        <span className="text-xs text-gray-400 ml-2">{patient.patientId}</span>
                      </p>
                      <p className="text-sm text-gray-500">{patient.phone} | {patient.gender}</p>
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <p className="text-md font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-blue-600" /> Patient Details
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Name *</Label>
                      <Input value={quickForm.name} onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Phone * (10 digits)</Label>
                      <Input value={quickForm.phone} onChange={(e) => setQuickForm({ ...quickForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit phone" pattern="[0-9]{10}" maxLength={10} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Gender</Label>
                      <Select
                        value={quickForm.gender}
                        onValueChange={(v) => v && setQuickForm({ ...quickForm, gender: v })}
                        items={{ MALE: "Male", FEMALE: "Female", OTHER: "Other" }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Age</Label>
                      <Input
                        type="number"
                        min={0}
                        value={quickForm.age}
                        onChange={(e) => {
                          const age = e.target.value;
                          if (age) setQuickForm({ ...quickForm, age, dob: `${new Date().getFullYear() - Number(age)}-01-01` });
                          else setQuickForm({ ...quickForm, age, dob: "" });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Date of Birth</Label>
                      <Input
                        type="date"
                        value={quickForm.dob}
                        onChange={(e) => {
                          const dob = e.target.value;
                          if (dob) {
                            const today = new Date();
                            const birth = new Date(dob);
                            let age = today.getFullYear() - birth.getFullYear();
                            const m = today.getMonth() - birth.getMonth();
                            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                            setQuickForm({ ...quickForm, dob, age: String(age) });
                          } else setQuickForm({ ...quickForm, dob, age: "" });
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Address</Label>
                    <Input value={quickForm.address} onChange={(e) => setQuickForm({ ...quickForm, address: e.target.value })} placeholder="Patient address" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Doctor *</Label>
                  <Select
                    value={form.doctorId}
                    onValueChange={(v) => v && setForm({ ...form, doctorId: v })}
                    items={Object.fromEntries(doctors.map(d => [d.id, d.name]))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Appointment Date *</Label>
                    <Input
                      type="date"
                      value={form.date}
                      min={todayStr()}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Fee</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional reason for visit"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Initial Checkup (Vitals)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Record the patient&apos;s vitals. These will be shown to the doctor in the queue.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <Activity className="h-3.5 w-3.5" /> Weight (kg)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      placeholder="e.g. 65"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <HeartPulse className="h-3.5 w-3.5" /> Height (cm)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min={0}
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      placeholder="e.g. 170"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3.5 w-3.5" /> Temp (°C)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.temperature}
                      onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                      placeholder="e.g. 98.6"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <HeartPulse className="h-3.5 w-3.5" /> Blood Pressure (sys/dia)
                    </Label>
                    <Input
                      type="text"
                      value={form.bloodPressure}
                      onChange={(e) => setForm({ ...form, bloodPressure: e.target.value })}
                      placeholder="e.g. 120/80"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-xs">
                      <Activity className="h-3.5 w-3.5" /> SpO2 (%)
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={form.oxygen}
                      onChange={(e) => setForm({ ...form, oxygen: e.target.value })}
                      placeholder="e.g. 98"
                    />
                  </div>
                </div>
                {selectedPatient && hasVitals && (
                  <p className="text-sm text-blue-600 font-medium">
                    Vitals will be saved with this appointment
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={loading || !selectedPatient || !form.doctorId || !form.date}
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  {loading ? "Booking..." : "Book Appointment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </>
  );
}

function TokenSlip({ token, appt, onClose }: { token: number; appt: { date?: string; patient?: { name: string; patientId?: string; phone?: string | null; gender?: string; age?: number; dob?: string | null; address?: string | null }; doctor?: { name: string }; vitals?: { weight?: string; height?: string; temperature?: string; bloodPressure?: string; oxygen?: string } | null }; onClose: () => void }) {
  const apptDate = appt.date ? new Date(appt.date).toLocaleString() : new Date().toLocaleString();
  const patientName = appt.patient?.name || "Patient";
  const patientId = appt.patient?.patientId || "";
  const patientPhone = appt.patient?.phone || "";
  const doctorName = appt.doctor?.name || "";
  const v = appt.vitals;
  const hasVitals = v && (v.weight || v.height || v.temperature || v.bloodPressure || v.oxygen);

  const handlePrint = () => {
    printHtml(prescriptionPrintHtml({
      token,
      patient: { name: patientName, patientId, phone: patientPhone, gender: appt.patient?.gender, age: appt.patient?.age, dob: appt.patient?.dob, address: appt.patient?.address },
      doctorName,
      date: appt.date,
      vitals: appt.vitals,
    }));
  };

  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
        <div>
          <p className="font-medium text-emerald-800">Appointment booked - Token #{token}</p>
          <p className="text-sm text-emerald-700">
            {patientName} - Dr. {doctorName} - {apptDate}
          </p>
          {hasVitals && (
            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-emerald-700">
              {v.weight && <span>{v.weight} kg</span>}
              {v.height && <span>{v.height} cm</span>}
              {v.temperature && <span>{v.temperature} C</span>}
              {v.bloodPressure && <span>BP {v.bloodPressure}</span>}
              {v.oxygen && <span>SpO2 {v.oxygen}%</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1.5" /> Print Slip
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function QueueTab() {
  const [appointments, setAppointments] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      setMessage(`Marked as ${status.replace("_", " ").toLowerCase()}`);
      fetchAppointments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to update status");
    }
  };

  const printSlip = (item: QueueItem) => {
    printHtml(prescriptionPrintHtml({
      token: item.token,
      patient: { name: item.patient.name, patientId: item.patient.patientId, phone: item.patient.phone, gender: item.patient.gender, age: item.patient.age, dob: item.patient.dob, address: item.patient.address },
      doctorName: item.doctor.name,
      date: item.date,
      vitals: item.vitals,
    }));
  };

  const todayAppointments = appointments.filter((a) => {
    const today = new Date().toDateString();
    return new Date(a.date).toDateString() === today;
  });

  const sorted = [...todayAppointments].sort((a, b) => a.token - b.token);
  const order = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  const scheduled = order.reduce<QueueItem[]>((acc, s) => {
    acc.push(...sorted.filter((a) => a.status === s));
    return acc;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "border-blue-200";
      case "IN_PROGRESS": return "border-yellow-300 bg-yellow-50";
      case "COMPLETED": return "border-green-200 bg-green-50";
      case "CANCELLED": return "border-red-200 bg-red-50 opacity-70";
      default: return "border-gray-200";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED": return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
      case "COMPLETED": return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const counts = order.reduce<Record<string, number>>((acc, s) => {
    acc[s] = todayAppointments.filter((a) => a.status === s).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {message && (
        <div className="p-3 rounded-md text-sm bg-blue-50 text-blue-700 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
          <p className="text-xs text-gray-500">Total Today</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-blue-600">{counts["SCHEDULED"] ?? 0}</p>
          <p className="text-xs text-gray-500">Scheduled</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-yellow-600">{counts["IN_PROGRESS"] ?? 0}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-2xl font-bold text-green-600">{counts["COMPLETED"] ?? 0}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Today&apos;s Queue
            </span>
            <Badge variant="secondary">{todayAppointments.length} appointments</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments today</p>
              <p className="text-sm text-gray-400 mt-1">Book an appointment to see it here</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {scheduled.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-wrap items-center justify-between gap-3 p-4 border rounded-xl transition-all duration-200 ${getStatusColor(item.status)}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-200">
                      <p className="text-xl font-bold text-gray-800">#{item.token}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{item.patient.name}</p>
                        <span className="text-xs text-gray-400">{item.patient.patientId}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm text-gray-500">
                        Dr. {item.doctor.name}
                        {item.patient.phone && ` | ${item.patient.phone}`}
                      </p>
                      {item.vitals && (item.vitals.weight || item.vitals.height || item.vitals.temperature || item.vitals.bloodPressure || item.vitals.oxygen) && (
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          {item.vitals.weight && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <Activity className="h-3 w-3 text-blue-500" /> {item.vitals.weight} kg
                            </span>
                          )}
                          {item.vitals.height && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <HeartPulse className="h-3 w-3 text-blue-500" /> {item.vitals.height} cm
                            </span>
                          )}
                          {item.vitals.temperature && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <TrendingUp className="h-3 w-3 text-blue-500" /> {item.vitals.temperature} C
                            </span>
                          )}
                          {item.vitals.bloodPressure && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <HeartPulse className="h-3 w-3 text-blue-500" /> BP {item.vitals.bloodPressure}
                            </span>
                          )}
                          {item.vitals.oxygen && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                              <Activity className="h-3 w-3 text-blue-500" /> SpO2 {item.vitals.oxygen}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "SCHEDULED" && (
                      <Button size="sm" onClick={() => updateStatus(item.id, "IN_PROGRESS")}>
                        Start
                      </Button>
                    )}
                    {item.status === "IN_PROGRESS" && (
                      <Button size="sm" onClick={() => updateStatus(item.id, "COMPLETED")}>
                        Complete
                      </Button>
                    )}
                    {item.status !== "CANCELLED" && item.status !== "COMPLETED" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "CANCELLED")}>
                        Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => printSlip(item)}>
                      <Printer className="h-4 w-4" />
                      Print
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function PatientsTab() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const limit = 20;

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "MALE",
    age: "",
    dob: "",
    address: "",
  });

  const fetchPatients = async (q: string, p: number) => {
    setLoading(true);
    try {
      const res = await api.get("/patients", { params: { search: q || undefined, page: p, limit } });
      setPatients(res.data.data);
      setTotal(res.data.meta?.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(search, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", gender: "MALE", age: "", dob: "", address: "" });
    setEditingPatient(null);
  };

  const openAddDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name,
      phone: patient.phone || "",
      email: patient.email || "",
      gender: patient.gender,
      age: String(patient.age),
      dob: patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : "",
      address: patient.address || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        gender: form.gender,
        age: Number(form.age),
        dob: form.dob ? new Date(form.dob).toISOString() : null,
        address: form.address,
      };
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, payload);
        setMessage("Patient updated successfully!");
      } else {
        await api.post("/patients", payload);
        setMessage("Patient registered successfully!");
      }
      setDialogOpen(false);
      resetForm();
      fetchPatients(search, page);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case "MALE": return <Badge className="bg-blue-100 text-blue-700">Male</Badge>;
      case "FEMALE": return <Badge className="bg-pink-100 text-pink-700">Female</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Other</Badge>;
    }
  };

  return (
    <>
      {message && (
        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${
          message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.includes("success") && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button className="ml-3" />}>
            <UserPlus className="h-4 w-4 mr-2" />
            Register
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Edit Patient" : "Register New Patient"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={form.gender} onValueChange={(v) => v && setForm({ ...form, gender: v })} items={{ MALE: "Male", FEMALE: "Female", OTHER: "Other" }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input type="number" min={0} max={150} value={form.age}
                    onChange={(e) => {
                      const age = e.target.value;
                      if (age) setForm({ ...form, age, dob: `${new Date().getFullYear() - Number(age)}-01-01` });
                      else setForm({ ...form, age, dob: "" });
                    }}
                    required />
                </div>
                <div className="space-y-2">
                  <Label>DOB</Label>
                  <Input type="date" value={form.dob}
                    onChange={(e) => {
                      const dob = e.target.value;
                      if (dob) {
                        const today = new Date();
                        const birth = new Date(dob);
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                        setForm({ ...form, dob, age: String(age) });
                      } else setForm({ ...form, dob, age: "" });
                    }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Phone * (10 digits)</Label>
                  <Input type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                    pattern="[0-9]{10}" maxLength={10} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : editingPatient ? "Update Patient" : "Register Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patients ({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No patients found</p>
                <p className="text-sm text-gray-400 mt-1">Register a patient to get started</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-blue-600">{patient.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <span className="text-xs text-gray-400">{patient.patientId}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {patient.phone && `${patient.phone} | `}
                        {patient.email || "No email"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        DOB: {patient.dob ? new Date(patient.dob).toLocaleDateString() : "N/A"}
                        {patient.address && ` | ${patient.address}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getGenderBadge(patient.gender)}
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(patient)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {total > limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
