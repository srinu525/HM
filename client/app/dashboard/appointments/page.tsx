"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarPlus, Calendar, Search, CheckCircle2, X, Filter, Download } from "lucide-react";

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

interface Appointment {
  id: string;
  token: number;
  status: string;
  date: string;
  validUntil: string | null;
  consultationFee: number;
  createdAt: string;
  patient: { id: string; patientId: string; name: string; phone: string | null };
  doctor: { id: string; name: string };
}

type Tab = "book" | "list";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const canCreate = user?.role === "SUPER_ADMIN" || user?.permissions?.some(p => p === "appointments.create");
  const [activeTab, setActiveTab] = useState<Tab>(canCreate ? "book" : "list");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-600 mt-1">Book and manage appointments</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {canCreate && (
          <button
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "book"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("book")}
          >
            <span className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              New Appointment
            </span>
          </button>
        )}
        <button
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("list")}
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments List
          </span>
        </button>
      </div>

      {activeTab === "book" && canCreate && <BookAppointment />}
      {activeTab === "list" && <AppointmentsList />}
    </div>
  );
}

function BookAppointment() {
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
    <>
      {message && (
        <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${
          message.includes("Token") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.includes("Token") && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <Label>Consultation Fee</Label>
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
    </>
  );
}

function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ doctorId: "", status: "", date: "" });

  useEffect(() => {
    async function load() {
      const dRes = await api.get("/users/doctors");
      setDoctors(dRes.data.data);
      await fetchAppointments();
    }
    load();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filters.doctorId && apt.doctor.id !== filters.doctorId) return false;
    if (filters.status && apt.status !== filters.status) return false;
    if (filters.date) {
      const aptDate = new Date(apt.date).toDateString();
      const filterDate = new Date(filters.date).toDateString();
      if (aptDate !== filterDate) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED": return <Badge className="bg-blue-100 text-blue-700">Scheduled</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>;
      case "COMPLETED": return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-red-100 text-red-700">Cancelled</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                value={filters.doctorId}
                onValueChange={(v) => setFilters({ ...filters, doctorId: v === "all" ? "" : (v ?? "") })}
                items={{ all: "All doctors", ...Object.fromEntries(doctors.map(d => [d.id, d.name])) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All doctors</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(v) => setFilters({ ...filters, status: v === "all" ? "" : (v ?? "") })}
                items={{ all: "All statuses", SCHEDULED: "Scheduled", IN_PROGRESS: "In Progress", COMPLETED: "Completed", CANCELLED: "Cancelled" }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointments
            </span>
            <Badge variant="secondary">{filteredAppointments.length} results</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No appointments found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Token</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">#{apt.token}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">{apt.patient.name}</p>
                        <p className="text-xs text-gray-500">{apt.patient.patientId}</p>
                      </td>
                      <td className="py-3 px-4">Dr. {apt.doctor.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(apt.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {apt.consultationFee > 0 ? (
                          <span className="text-green-600 font-medium">${apt.consultationFee}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(apt.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
