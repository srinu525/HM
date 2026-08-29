"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
import { Building2, Users, Pencil } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
  consultationFee: number | null;
  workingHours: string | null;
  isActive: boolean;
  _count?: { users: number };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Department | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    consultationFee: "",
    workingHours: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    consultationFee: "",
    workingHours: "",
  });

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/departments", {
        name: form.name,
        description: form.description || undefined,
        consultationFee: form.consultationFee ? Number(form.consultationFee) : undefined,
        workingHours: form.workingHours || undefined,
      });
      setMessage("Department created successfully!");
      setForm({ name: "", description: "", consultationFee: "", workingHours: "" });
      setAddDialogOpen(false);
      fetchDepartments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog) return;
    setLoading(true);
    try {
      await api.put(`/departments/${editDialog.id}`, {
        name: editForm.name,
        description: editForm.description || undefined,
        consultationFee: editForm.consultationFee ? Number(editForm.consultationFee) : undefined,
        workingHours: editForm.workingHours || undefined,
      });
      setMessage("Department updated!");
      setEditDialog(null);
      fetchDepartments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (dept: Department) => {
    try {
      await api.put(`/departments/${dept.id}/toggle-active`);
      fetchDepartments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage hospital departments</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Building2 className="h-4 w-4 mr-2" />
            Add Department
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Cardiology"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description of the department"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Consultation Fee</Label>
                  <Input
                    type="number"
                    value={form.consultationFee}
                    onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Working Hours</Label>
                  <Input
                    value={form.workingHours}
                    onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                    placeholder="e.g. 9AM - 5PM"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Department"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("success") || message.includes("updated")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Departments ({departments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 ${
                  !dept.isActive ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-indigo-600">
                      {dept.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{dept.name}</p>
                    {dept.description && (
                      <p className="text-sm text-gray-500">{dept.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      {dept.consultationFee != null && dept.consultationFee > 0 && (
                        <span>Fee: ₹{dept.consultationFee}</span>
                      )}
                      {dept.workingHours && <span>{dept.workingHours}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {dept._count != null && (
                    <span className="hidden sm:flex items-center gap-1 text-sm text-gray-500 mr-3">
                      <Users className="h-3.5 w-3.5" />
                      {dept._count.users}
                    </span>
                  )}
                  <Badge className={dept.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {dept.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditDialog(dept);
                      setEditForm({
                        name: dept.name,
                        description: dept.description || "",
                        consultationFee: dept.consultationFee != null ? String(dept.consultationFee) : "",
                        workingHours: dept.workingHours || "",
                      });
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={dept.isActive ? "outline" : "destructive"}
                    onClick={() => toggleActive(dept)}
                  >
                    {dept.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
            {departments.length === 0 && (
              <p className="text-center text-gray-500 py-8">No departments found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={(open) => { if (!open) setEditDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editDialog?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Consultation Fee</Label>
                <Input type="number" value={editForm.consultationFee} onChange={(e) => setEditForm({ ...editForm, consultationFee: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Working Hours</Label>
                <Input value={editForm.workingHours} onChange={(e) => setEditForm({ ...editForm, workingHours: e.target.value })} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
