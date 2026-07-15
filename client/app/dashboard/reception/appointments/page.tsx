"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, Search, CheckCircle2, X } from "lucide-react";

interface Patient {
  id: string;
  patientId: string;
  name: string;
  phone: string | null;
  email: string | null;
  gender: string;
  dob: string | null;
  address: string | null;
}

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export default function NewAppointmentPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [form, setForm] = useState({
    doctorId: "",
    notes: "",
    consultationFee: "",
    validUntil: "",
  });

  useEffect(() => {
    async function load() {
      const [pRes, dRes] = await Promise.all([
        api.get("/patients"),
        api.get("/users/doctors"),
      ]);
      setPatients(pRes.data.data);
      setDoctors(dRes.data.data);
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

  const resetForm = () => {
    setForm({ doctorId: "", notes: "", consultationFee: "", validUntil: "" });
    setSelectedPatient(null);
    setSearch("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      setMessage("Please select a patient first");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await api.post("/appointments", {
        patientId: selectedPatient.id,
        doctorId: form.doctorId,
        notes: form.notes,
        consultationFee: form.consultationFee ? parseFloat(form.consultationFee) : 0,
        validUntil: form.validUntil || undefined,
      });
      setMessage(`Appointment booked! Token #${res.data.data.token}`);
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">New Appointment</h1>
        <p className="text-gray-600 mt-1">Book a new appointment for a patient</p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm flex items-center gap-2 ${
            message.includes("Token")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.includes("Token") && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Patient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search patient by name or phone..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
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

              <div className="max-h-64 overflow-y-auto space-y-2">
                {patients.slice(0, 10).map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedPatient?.id === patient.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      {patient.name}
                      <span className="text-xs text-gray-400 ml-2">{patient.patientId}</span>
                    </p>
                    <p className="text-sm text-gray-500">{patient.phone} | {patient.gender}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5" />
              Appointment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-3">
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

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading || !selectedPatient || !form.doctorId}
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                {loading ? "Booking..." : "Book Appointment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
