"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, CalendarPlus, CheckCircle2, Search, X } from "lucide-react";

interface Patient {
  id: string;
  patientId: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string;
  dob: string;
  address: string | null;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface Appointment {
  id: string;
  token: number;
  status: string;
  date: string;
  validUntil: string | null;
  consultationFee: number;
  patient: { id: string; patientId: string; name: string; phone: string | null };
  doctor: { id: string; name: string };
}

export default function ReceptionPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "MALE",
    dob: "",
    address: "",
    doctorId: "",
    notes: "",
    consultationFee: "",
    validUntil: "",
  });

  const fetchPatients = async (q?: string) => {
    try {
      const res = await api.get("/patients", { params: { search: q || undefined } });
      setPatients(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/users/doctors");
      setDoctors(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchPatients();
    fetchDoctors();
    fetchAppointments();
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchPatients(value);
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", gender: "MALE", dob: "", address: "", doctorId: "", notes: "", consultationFee: "", validUntil: "" });
    setSelectedPatient(null);
  };

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setForm((prev) => ({
      ...prev,
      name: patient.name,
      phone: patient.phone || "",
      email: patient.email || "",
      gender: patient.gender,
      dob: patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : "",
      address: patient.address || "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      let patientId = selectedPatient?.id;

      if (!patientId) {
        const patientRes = await api.post("/patients", {
          name: form.name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          dob: new Date(form.dob).toISOString(),
          address: form.address,
        });
        patientId = patientRes.data.id;
        setMessage(`Patient "${patientRes.data.name}" registered! `);
      }

      const aptRes = await api.post("/appointments", {
        patientId,
        doctorId: form.doctorId,
        notes: form.notes,
        consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : 0,
        validUntil: form.validUntil || undefined,
      });
      setMessage((prev) => `Appointment booked! Token #${aptRes.data.token}`);

      resetForm();
      fetchAppointments();
      fetchPatients();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to process");
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = appointments.filter((a) => {
    const today = new Date().toDateString();
    return new Date(a.date).toDateString() === today;
  });

  const completedToday = todayAppointments.filter((a) => a.status === "COMPLETED").length;
  const pendingToday = todayAppointments.filter((a) => a.status === "SCHEDULED" || a.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reception</h1>
          <p className="text-gray-600 mt-1">Patient registration & appointment booking</p>
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
          className={`p-3 rounded-md text-sm flex items-center gap-2 ${
            message.includes("Token") || message.includes("registered")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {(message.includes("Token") || message.includes("registered")) && (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Registration + Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5" />
                Register & Book Appointment
              </span>
              {selectedPatient && (
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search existing patient by name or phone..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {search.length >= 2 && patients.length > 0 && (
                <div className="border rounded-lg max-h-32 overflow-y-auto">
                  {patients.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        selectPatient(p);
                        setSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 flex justify-between items-center ${
                        selectedPatient?.id === p.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{p.name} <span className="text-xs text-gray-400 ml-1">{p.patientId}</span></p>
                        <p className="text-xs text-gray-500">{p.phone} | {p.gender}</p>
                      </div>
                      {selectedPatient?.id === p.id && (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {selectedPatient && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{selectedPatient.name} <span className="text-sm ml-1">{selectedPatient.patientId}</span></p>
                    <p className="text-sm text-blue-700">
                      {selectedPatient.phone} | {selectedPatient.gender}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="border-t" />

              {/* Patient Fields */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <UserPlus className="h-4 w-4" />
                  Patient Details
                </p>
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Phone * (10 digits)</Label>
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                      }
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender *</Label>
                    <Select
                      value={form.gender}
                      onValueChange={(v) => v && setForm({ ...form, gender: v })}
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
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={form.dob}
                      onChange={(e) => setForm({ ...form, dob: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address *</Label>
                  <Input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="border-t" />

              {/* Appointment Fields */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <CalendarPlus className="h-4 w-4" />
                  Appointment Details
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select
                      value={form.doctorId}
                      onValueChange={(v) => v && setForm({ ...form, doctorId: v })}
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
                  <div className="space-y-2">
                    <Label>Consultation Fee (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valid Until</Label>
                    <Input
                      type="date"
                      value={form.validUntil}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                {loading ? "Processing..." : selectedPatient ? "Book Appointment" : "Register & Book"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right: Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today&apos;s Appointments</span>
              <span className="text-sm font-normal text-gray-500">{todayAppointments.length} today</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {todayAppointments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No appointments today</p>
              ) : (
                todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        Token #{apt.token} - {apt.patient.name} <span className="text-sm text-gray-400">{apt.patient.patientId}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Dr. {apt.doctor.name}
                        {apt.consultationFee > 0 && (
                          <span className="ml-2 text-green-600 font-medium">₹{apt.consultationFee}</span>
                        )}
                      </p>
                      {apt.validUntil && (
                        <p className="text-xs text-orange-500">
                          Valid until: {new Date(apt.validUntil).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        apt.status === "COMPLETED"
                          ? "default"
                          : apt.status === "CANCELLED"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
