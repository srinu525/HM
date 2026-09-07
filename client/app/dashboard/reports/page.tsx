"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
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
import { Calendar, User, Stethoscope, FileText, Download } from "lucide-react";
import { format } from "date-fns";

interface Appointment {
  id: string;
  date: string;
  token: number;
  status: string;
  consultationFee: number;
  patient: { id: string; patientId?: string; name: string; phone: string };
  doctor: { id: string; name: string };
  consultation?: {
    diagnosis: string | null;
    notes: string | null;
    prescriptions: {
      notes: string | null;
      items: {
        dosage: string;
        duration: string;
        instructions: string | null;
        medicine: { name: string };
      }[];
    }[];
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  interface DoctorOption { id: string; name: string; role: string }
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    doctorId: "",
    patientId: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (filters.doctorId || filters.patientId || filters.startDate || filters.endDate) {
      loadHistory();
    }
  }, [filters]);

  const loadDoctors = async () => {
    try {
      const res = await api.get("/users/doctors");
      setDoctors(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.doctorId) params.doctorId = filters.doctorId;
      if (filters.patientId) params.patientId = filters.patientId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await api.get("/stats/appointments/history", { params });
      setAppointments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "IN_PROGRESS":
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalFees = appointments.reduce((sum, apt) => sum + (apt.consultationFee || 0), 0);

  const exportCSV = () => {
    const headers = ["Date", "Token", "Patient", "Phone", "Doctor", "Fee", "Status", "Diagnosis"];
    const rows = appointments.map(apt => [
      format(new Date(apt.date), "yyyy-MM-dd"),
      apt.token,
      apt.patient.name,
      apt.patient.phone,
      `Dr. ${apt.doctor.name}`,
      apt.consultationFee || 0,
      apt.status,
      apt.consultation?.diagnosis || "",
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `appointments-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Appointment History</h1>
        <p className="text-gray-600 mt-1">View and filter past appointments</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filters</span>
            {appointments.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                value={filters.doctorId}
                onValueChange={(v) => setFilters({ ...filters, doctorId: v ?? "" })}
                items={{ "": "All doctors", ...Object.fromEntries(doctors.map(d => [d.id, d.name])) }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All doctors</SelectItem>
                  {doctors.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Patient Name/ID</Label>
              <Input
                type="text"
                value={filters.patientId}
                onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
                placeholder="Filter by patient"
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => setFilters({ doctorId: "", patientId: "", startDate: "", endDate: "" })}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Appointments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{appointments.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{appointments.filter(a => a.status === "COMPLETED").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalFees.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"} found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">#{apt.token}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{apt.patient.name} {apt.patient.patientId && <span className="text-sm text-gray-400">{apt.patient.patientId}</span>}</p>
                        <p className="text-sm text-gray-500">
                          {apt.patient.phone} | {format(new Date(apt.date), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>

                    <div className="ml-15 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>Dr. {apt.doctor.name}</span>
                      </div>
                      {apt.consultationFee > 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          Fee: ₹{apt.consultationFee}
                        </p>
                      )}
                      {apt.consultation?.diagnosis && (
                        <div className="flex items-start gap-2 text-sm">
                          <Stethoscope className="h-3 w-3 mt-0.5 text-gray-400" />
                          <span className="text-gray-600">{apt.consultation.diagnosis}</span>
                        </div>
                      )}
                      {apt.consultation?.prescriptions?.[0] && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-3 w-3 mt-0.5 text-gray-400" />
                          <span className="text-gray-600">
                            {apt.consultation.prescriptions[0].items.length} medicine(s) prescribed
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant={getStatusColor(apt.status)}>{apt.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}