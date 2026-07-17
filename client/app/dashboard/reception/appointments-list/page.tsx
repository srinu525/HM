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
import { Calendar, Filter, Download } from "lucide-react";

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

interface Doctor {
  id: string;
  name: string;
}

export default function AppointmentsListPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    doctorId: "",
    status: "",
    date: "",
  });

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments List</h1>
          <p className="text-gray-600 mt-1">View and filter all appointments</p>
        </div>
        <Button variant="outline" onClick={fetchAppointments}>
          <Download className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
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
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
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

      {/* Appointments Table */}
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
                          <span className="text-green-600 font-medium">₹{apt.consultationFee}</span>
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
    </div>
  );
}
