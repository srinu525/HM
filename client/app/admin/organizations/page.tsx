"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Building2, Plus, Users, Stethoscope, Activity,
  ToggleLeft, ToggleRight, ExternalLink, Search,
} from "lucide-react";
import Link from "next/link";

interface OrgWithCounts {
  id: string; name: string; slug: string; email?: string;
  phone?: string; address?: string; isActive: boolean; createdAt: string;
  _count: { users: number; patients: number; medicines: number };
  subscriptions?: { plan: { name: string }; status: string }[];
}

const PLAN_COLOR: Record<string, string> = {
  Free: "text-slate-400 bg-slate-500/10",
  Starter: "text-blue-400 bg-blue-500/10",
  Professional: "text-violet-400 bg-violet-500/10",
  Enterprise: "text-amber-400 bg-amber-500/10",
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", email: "", phone: "", address: "", timezone: "UTC", currency: "INR" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.getOrganizations()
      .then((res) => { setOrgs(res.data.data); setError(""); })
      .catch(() => setError("Failed to load organizations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = orgs.filter((o) => {
    const matchSearch =
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.slug.toLowerCase().includes(search.toLowerCase()) ||
      (o.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && o.isActive) ||
      (statusFilter === "inactive" && !o.isActive);
    return matchSearch && matchStatus;
  });

  const handleCreate = async () => {
    if (!form.name || !form.slug) return;
    setCreating(true); setError("");
    try {
      await adminApi.createOrganization(form);
      setCreateOpen(false);
      setForm({ name: "", slug: "", email: "", phone: "", address: "", timezone: "UTC", currency: "INR" });
      load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create organization");
    }
    setCreating(false);
  };

  const handleToggleActive = async (org: OrgWithCounts) => {
    await adminApi.updateOrganization(org.id, { isActive: !org.isActive });
    load();
  };

  const counts = {
    total: orgs.length,
    active: orgs.filter(o => o.isActive).length,
    withSub: orgs.filter(o => o.subscriptions && o.subscriptions.length > 0).length,
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Organizations</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {counts.total} total · {counts.active} active · {counts.withSub} subscribed
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button className="bg-rose-600 hover:bg-rose-700 text-white gap-2"><Plus className="w-4 h-4" /> New Organization</Button>} />
          <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create Organization</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {error && <p className="text-sm text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs">Hospital Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 bg-slate-800 border-slate-700 text-white" placeholder="City Hospital" />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">URL Slug *</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                    className="mt-1 bg-slate-800 border-slate-700 text-white" placeholder="city-hospital" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs">Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 bg-slate-800 border-slate-700 text-white" type="email" />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-300 text-xs">Timezone</Label>
                  <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                    className="mt-1 bg-slate-800 border-slate-700 text-white" placeholder="Asia/Kolkata" />
                </div>
                <div>
                  <Label className="text-slate-300 text-xs">Currency</Label>
                  <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="mt-1 bg-slate-800 border-slate-700 text-white" placeholder="INR" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300 text-xs">Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="mt-1 bg-slate-800 border-slate-700 text-white" />
              </div>
              <Button onClick={handleCreate} disabled={creating || !form.name || !form.slug} className="w-full bg-rose-600 hover:bg-rose-700">
                {creating ? "Creating..." : "Create Organization"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      {error && !createOpen && <div className="px-4 py-2.5 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{error}</div>}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organizations..."
            className="pl-9 pr-3 h-9 w-64 text-sm bg-slate-900 border border-slate-700 text-slate-200 rounded-lg outline-none focus:border-rose-500/50 placeholder:text-slate-600"
          />
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                statusFilter === f ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}>
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} results</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No organizations found</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Plan</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Users</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Patients</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((org) => {
                const sub = org.subscriptions?.[0];
                return (
                  <tr key={org.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg flex items-center justify-center shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{org.name}</p>
                          <p className="text-[11px] text-slate-500">/{org.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {sub ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLAN_COLOR[sub.plan.name] ?? "text-slate-400 bg-slate-700"}`}>
                          {sub.plan.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">No plan</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 hidden sm:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Users className="w-3 h-3" />{org._count.users}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        <Stethoscope className="w-3 h-3" />{org._count.patients}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                        <span className={`text-xs ${org.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                          {org.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/organizations/${org.id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleToggleActive(org)}
                          className={`p-1.5 rounded-lg transition-colors ${org.isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-slate-700"}`}>
                          {org.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
