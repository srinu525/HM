"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useDebounce } from "@/hooks/use-debounce";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, Edit, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

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
  createdAt: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
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

  const fetchPatients = useCallback(async (q: string, p: number) => {
    try {
      const res = await api.get("/patients", { params: { search: q || undefined, page: p, limit } });
      setPatients(res.data.data);
      setTotal(res.data.meta?.total || 0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchPatients(debouncedSearch, page);
  }, [debouncedSearch, page, fetchPatients]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

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
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, {
          name: form.name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          age: Number(form.age),
          dob: form.dob ? new Date(form.dob).toISOString() : null,
          address: form.address,
        });
        setMessage("Patient updated successfully!");
      } else {
        await api.post("/patients", {
          name: form.name,
          phone: form.phone,
          email: form.email,
          gender: form.gender,
          age: Number(form.age),
          dob: form.dob ? new Date(form.dob).toISOString() : null,
          address: form.address,
        });
        setMessage("Patient registered successfully!");
      }
      setDialogOpen(false);
      resetForm();
      fetchPatients(debouncedSearch, page);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Registration</h1>
          <p className="text-gray-600 mt-1">Register and manage patients</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button />}>
            <UserPlus className="h-4 w-4 mr-2" />
            Register Patient
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPatient ? "Edit Patient" : "Register New Patient"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
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
                <div className="space-y-2">
                  <Label>Age *</Label>
                  <Input
                    type="number"
                    min={0}
                    max={150}
                    value={form.age}
                    onChange={(e) => {
                      const age = e.target.value;
                      if (age) {
                        const birthYear = new Date().getFullYear() - Number(age);
                        setForm({ ...form, age, dob: `${birthYear}-01-01` });
                      } else {
                        setForm({ ...form, age, dob: "" });
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => {
                      const dob = e.target.value;
                      if (dob) {
                        const today = new Date();
                        const birth = new Date(dob);
                        let age = today.getFullYear() - birth.getFullYear();
                        const m = today.getMonth() - birth.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
                        setForm({ ...form, dob, age: String(age) });
                      } else {
                        setForm({ ...form, dob, age: "" });
                      }
                    }}
                  />
                </div>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : editingPatient ? "Update Patient" : "Register Patient"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm flex items-center gap-2 ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.includes("success") && <CheckCircle2 className="h-4 w-4 shrink-0" />}
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patients ({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, phone, or ID..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {patients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No patients found</p>
                <p className="text-sm text-gray-400 mt-1">Register a patient to get started</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg font-bold text-blue-600">
                        {patient.name.charAt(0).toUpperCase()}
                      </span>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {total > limit && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {page} of {Math.ceil(total / limit)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil(total / limit)}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
