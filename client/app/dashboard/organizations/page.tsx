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
import { Building2, Users, UserPlus, Pencil, BarChart3 } from "lucide-react";

interface OrgStats {
  _count: { users: number; patients: number; medicines: number; notifications: number };
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; patients: number };
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState<Organization | null>(null);
  const [statsDialog, setStatsDialog] = useState<OrgStats | null>(null);

  const [form, setForm] = useState({ name: "", slug: "", email: "", phone: "", address: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" });

  const fetchOrgs = async () => {
    try {
      const res = await api.get("/organizations");
      setOrgs(res.data.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchOrgs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/organizations", {
        name: form.name,
        slug: form.slug.replace(/\s+/g, "-").toLowerCase(),
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
      });
      setMessage("Organization created successfully!");
      setForm({ name: "", slug: "", email: "", phone: "", address: "" });
      setAddDialogOpen(false);
      fetchOrgs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDialog) return;
    setLoading(true);
    try {
      await api.put(`/organizations/${editDialog.id}`, {
        name: editForm.name,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        address: editForm.address || undefined,
      });
      setMessage("Organization updated!");
      setEditDialog(null);
      fetchOrgs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (org: Organization) => {
    try {
      await api.put(`/organizations/${org.id}`, { isActive: !org.isActive });
      fetchOrgs();
    } catch (error) { console.error(error); }
  };

  const openStats = async (id: string) => {
    try {
      const res = await api.get(`/organizations/${id}/stats`);
      setStatsDialog(res.data.data);
    } catch (error) { console.error(error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-600 mt-1">Manage hospital organizations</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Building2 className="h-4 w-4 mr-2" />
            Add Organization
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>New Organization</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Slug * (URL-friendly)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. city-hospital" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Organization"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.includes("success") || message.includes("updated")
          ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizations ({orgs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orgs.map((org) => (
              <div
                key={org.id}
                className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 ${
                  !org.isActive ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-blue-600">
                      {org.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{org.name}</p>
                    <p className="text-sm text-gray-500">/{org.slug}</p>
                    {org.email && <p className="text-sm text-gray-400">{org.email}</p>}
                    {org.phone && <p className="text-sm text-gray-400">{org.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {org._count && (
                    <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500 mr-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />{org._count.users}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserPlus className="h-3.5 w-3.5" />{org._count.patients}
                      </span>
                    </div>
                  )}
                  <Badge className={org.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {org.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => openStats(org.id)}>
                    <BarChart3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditDialog(org);
                    setEditForm({ name: org.name, email: org.email || "", phone: org.phone || "", address: org.address || "" });
                  }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant={org.isActive ? "outline" : "destructive"} onClick={() => toggleActive(org)}>
                    {org.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
            {orgs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No organizations found</p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={!!statsDialog} onOpenChange={(open) => { if (!open) setStatsDialog(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Organization Stats</DialogTitle>
          </DialogHeader>
          {statsDialog && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{statsDialog._count.users}</p>
                <p className="text-sm text-gray-600">Users</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{statsDialog._count.patients}</p>
                <p className="text-sm text-gray-600">Patients</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{statsDialog._count.medicines}</p>
                <p className="text-sm text-gray-600">Medicines</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{statsDialog._count.notifications}</p>
                <p className="text-sm text-gray-600">Notifications</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
