"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Building2, Plus, Users, Stethoscope, Activity, Edit, ToggleLeft, ToggleRight } from "lucide-react";

interface OrgWithCounts {
  id: string;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  _count: { users: number; patients: number; medicines: number };
  subscriptions?: { plan: { name: string } }[];
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOrg, setEditOrg] = useState<OrgWithCounts | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", email: "", phone: "", address: "" });

  const load = () => {
    setLoading(true);
    adminApi.getOrganizations().then((res) => setOrgs(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = orgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.slug.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!form.name || !form.slug) return;
    try {
      await adminApi.createOrganization(form);
      setCreateOpen(false);
      setForm({ name: "", slug: "", email: "", phone: "", address: "" });
      load();
    } catch { /* empty */ }
  };

  const handleUpdate = async () => {
    if (!editOrg) return;
    try {
      await adminApi.updateOrganization(editOrg.id, form);
      setEditOrg(null);
      load();
    } catch { /* empty */ }
  };

  const handleToggleActive = async (org: OrgWithCounts) => {
    try {
      await adminApi.updateOrganization(org.id, { isActive: !org.isActive });
      load();
    } catch { /* empty */ }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
          <p className="text-gray-500 mt-1">Manage all hospitals on the platform</p>
        </div>
        <div className="flex gap-3">
          <Input placeholder="Search organizations..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
<DialogTrigger render={<Button className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white" />}>
  <Plus className="w-4 h-4 mr-2" /> New Organization
</DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create Organization</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="e.g. city-hospital" /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <Button onClick={handleCreate} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No organizations found</div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((org) => (
            <div key={org.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">/{org.slug}{org.email ? ` • ${org.email}` : ""}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{org._count.users} users</span>
                      <span className="flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" />{org._count.patients} patients</span>
                      <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" />{org._count.medicines} medicines</span>
                      {org.subscriptions?.[0] && <span className="text-blue-600 font-medium">{org.subscriptions[0].plan.name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditOrg(org); setForm({ name: org.name, slug: org.slug, email: org.email || "", phone: org.phone || "", address: org.address || "" }); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleActive(org)} className={`p-2 rounded-lg transition-colors ${org.isActive ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                    {org.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editOrg} onOpenChange={(o) => { if (!o) setEditOrg(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Organization</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <Button onClick={handleUpdate} className="w-full">Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
