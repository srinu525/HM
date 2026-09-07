"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { adminApi, billingApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Users, Stethoscope, Activity, ArrowLeft,
  CreditCard, Zap, User, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, AlertTriangle, History, Shield,
} from "lucide-react";

const AVAILABLE_FLAGS = [
  { key: "appointments", name: "Appointments" },
  { key: "pharmacy", name: "Pharmacy" },
  { key: "lab", name: "Lab" },
  { key: "billing", name: "Billing" },
  { key: "notifications", name: "Notifications" },
  { key: "audit_logs", name: "Audit Logs" },
  { key: "file_uploads", name: "File Uploads" },
  { key: "reports", name: "Reports" },
];

const STATUS_META: Record<string, { bg: string; text: string; dot: string }> = {
  ACTIVE:    { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  TRIAL:     { bg: "bg-blue-500/10",    text: "text-blue-400",    dot: "bg-blue-400" },
  CANCELLED: { bg: "bg-rose-500/10",    text: "text-rose-400",    dot: "bg-rose-400" },
  EXPIRED:   { bg: "bg-slate-700",      text: "text-slate-400",   dot: "bg-slate-500" },
};

const HISTORY_COLOR: Record<string, string> = {
  SUBSCRIBED:    "text-emerald-400",
  UPGRADED:      "text-blue-400",
  DOWNGRADED:    "text-amber-400",
  CANCELLED:     "text-rose-400",
  RENEWED:       "text-teal-400",
  TRIAL_STARTED: "text-violet-400",
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN: "text-blue-400 bg-blue-500/10",
  DOCTOR: "text-violet-400 bg-violet-500/10",
  RECEPTIONIST: "text-emerald-400 bg-emerald-500/10",
  PHARMACIST: "text-amber-400 bg-amber-500/10",
};

export default function OrgDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [org, setOrg] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<{ key: string; name: string; isEnabled: boolean }[]>([]);
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignMonths, setAssignMonths] = useState(1);
  const [assignNote, setAssignNote] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [orgRes, plansRes] = await Promise.all([adminApi.getOrganization(id), billingApi.getPlans()]);
      const o = orgRes.data.data;
      setOrg(o);
      setPlans(plansRes.data.data.filter((p: any) => p.isActive));
      setEditForm({
        name: o.name, email: o.email || "", phone: o.phone || "",
        address: o.address || "", timezone: o.timezone || "UTC",
        currency: o.currency || "INR", gstVat: o.gstVat || "",
        hospitalLicense: o.hospitalLicense || "",
      });
      const existing = o.featureFlags || [];
      setFlags(AVAILABLE_FLAGS.map((f) => {
        const found = existing.find((e: any) => e.key === f.key);
        return { ...f, isEnabled: found ? found.isEnabled : true };
      }));
      setError("");
    } catch { setError("Failed to load organization details"); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const notify = (text: string, ok = true) => { setMessage({ text, ok }); setTimeout(() => setMessage(null), 3000); };

  const saveDetails = async () => {
    setSaving(true);
    try { await adminApi.updateOrganization(id, editForm); notify("Organization updated"); load(); }
    catch { notify("Failed to update", false); }
    setSaving(false);
  };

  const toggleFlag = async (key: string, cur: boolean) => {
    try {
      await adminApi.setFeatureFlag(id, key, !cur);
      setFlags((prev) => prev.map((f) => f.key === key ? { ...f, isEnabled: !cur } : f));
    } catch { /* empty */ }
  };

  const handleAssign = async () => {
    if (!assignPlanId) return;
    setAssigning(true);
    try {
      await adminApi.forceAssignPlan(id, assignPlanId, assignMonths, assignNote || undefined);
      notify("Plan assigned"); setAssignPlanId(""); setAssignNote(""); load();
    } catch { notify("Failed to assign", false); }
    setAssigning(false);
  };

  const handleCancelSub = async () => {
    if (!confirm("Cancel this subscription?")) return;
    try { await adminApi.forceCancelSubscription(id, "Cancelled by super admin"); notify("Subscription cancelled"); load(); }
    catch { notify("Failed to cancel", false); }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-slate-900 border border-slate-800 rounded-xl h-20" />
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-20" />)}</div>
    </div>
  );
  if (!org) return <div className="text-center py-12 text-slate-500">{error || "Organization not found"}</div>;

  const sub = org.subscriptions?.[0];
  const subMeta = sub ? (STATUS_META[sub.status] ?? STATUS_META.EXPIRED) : null;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/organizations")}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white truncate">{org.name}</h1>
            <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${org.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${org.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
              {org.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-slate-500">/{org.slug} · Created {new Date(org.createdAt).toLocaleDateString()}</p>
        </div>
        <button onClick={() => adminApi.updateOrganization(id, { isActive: !org.isActive }).then(load)}
          className={`p-2 rounded-lg transition-colors ${org.isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-slate-500 hover:bg-slate-800"}`}>
          {org.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
        </button>
      </div>

      {message && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${message.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Staff Users", value: org._count?.users ?? 0, icon: Users, color: "bg-blue-500" },
          { label: "Patients", value: org._count?.patients ?? 0, icon: Stethoscope, color: "bg-violet-500" },
          { label: "Medicines", value: org._count?.medicines ?? 0, icon: Activity, color: "bg-amber-500" },
          { label: "Notifications", value: org._count?.notifications ?? 0, icon: Zap, color: "bg-rose-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-[11px] text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" /> Organization Details
          </h2>
          {editForm && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["name", "Name"], ["email", "Email"],
                  ["phone", "Phone"], ["timezone", "Timezone"],
                  ["currency", "Currency"], ["gstVat", "GST/VAT"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <Label className="text-[11px] text-slate-500">{label}</Label>
                    <Input value={editForm[key]} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      className="mt-1 bg-slate-800 border-slate-700 text-slate-200 h-8 text-sm" />
                  </div>
                ))}
              </div>
              <div>
                <Label className="text-[11px] text-slate-500">Address</Label>
                <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="mt-1 bg-slate-800 border-slate-700 text-slate-200 h-8 text-sm" />
              </div>
              <div>
                <Label className="text-[11px] text-slate-500">Hospital License</Label>
                <Input value={editForm.hospitalLicense} onChange={(e) => setEditForm({ ...editForm, hospitalLicense: e.target.value })}
                  className="mt-1 bg-slate-800 border-slate-700 text-slate-200 h-8 text-sm" />
              </div>
              <Button onClick={saveDetails} disabled={saving} className="w-full bg-rose-600 hover:bg-rose-700 text-white h-9">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Subscription */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" /> Subscription
          </h2>

          {sub && subMeta ? (
            <div className="space-y-3 mb-4">
              <div className={`flex items-center justify-between p-3 rounded-lg ${subMeta.bg}`}>
                <div>
                  <p className="font-semibold text-white">{sub.plan.name}</p>
                  <p className="text-xs text-slate-400">₹{sub.plan.price}/mo · {sub.cycle}</p>
                </div>
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${subMeta.bg} ${subMeta.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${subMeta.dot}`} />{sub.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-slate-500 mb-0.5">Started</p>
                  <p className="text-slate-200 font-medium">{new Date(sub.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-slate-500 mb-0.5">Expires</p>
                  <p className="text-slate-200 font-medium">{sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "No expiry"}</p>
                </div>
              </div>
              {sub.status === "ACTIVE" && (
                <Button variant="destructive" size="sm" onClick={handleCancelSub} className="w-full h-8 text-xs">
                  Cancel Subscription
                </Button>
              )}
              {sub.history?.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" /> History
                  </p>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {sub.history.map((h: any) => (
                      <div key={h.id} className="flex items-center justify-between text-[11px]">
                        <span className={`font-semibold ${HISTORY_COLOR[h.action] ?? "text-slate-400"}`}>{h.action}</span>
                        <span className="text-slate-500">{h.toPlanName ?? h.fromPlanName ?? "—"}</span>
                        <span className="text-slate-600">{new Date(h.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg mb-4">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> No active subscription
            </div>
          )}

          {/* Force assign */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-400">Force Assign Plan</p>
            <select value={assignPlanId} onChange={(e) => setAssignPlanId(e.target.value)}
              className="w-full h-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none focus:border-rose-500/50">
              <option value="">Select plan...</option>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/mo</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-slate-500">Months</Label>
                <Input type="number" min={1} value={assignMonths} onChange={(e) => setAssignMonths(Number(e.target.value))}
                  className="mt-1 bg-slate-800 border-slate-700 text-slate-200 h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px] text-slate-500">Note</Label>
                <Input value={assignNote} onChange={(e) => setAssignNote(e.target.value)} placeholder="optional"
                  className="mt-1 bg-slate-800 border-slate-700 text-slate-200 h-8 text-xs" />
              </div>
            </div>
            <Button onClick={handleAssign} disabled={!assignPlanId || assigning} className="w-full bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs">
              {assigning ? "Assigning..." : "Assign Plan"}
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" /> Feature Flags
          <span className="text-[11px] text-slate-500 font-normal ml-1">({flags.filter(f => f.isEnabled).length}/{flags.length} enabled)</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {flags.map((flag) => (
            <button key={flag.key} onClick={() => toggleFlag(flag.key, flag.isEnabled)}
              className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                flag.isEnabled ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10" : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
              }`}>
              <span className={`text-xs font-medium ${flag.isEnabled ? "text-slate-200" : "text-slate-500"}`}>{flag.name}</span>
              {flag.isEnabled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Users */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" /> Staff Users ({org.users?.length ?? 0})
        </h2>
        {(!org.users || org.users.length === 0) ? (
          <p className="text-sm text-slate-500 text-center py-6">No users yet</p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {org.users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-slate-300">{u.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{u.name}</p>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLOR[u.role] ?? "text-slate-400 bg-slate-700"}`}>
                    {u.role}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
