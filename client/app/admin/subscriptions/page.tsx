"use client";

import { useEffect, useState } from "react";
import { adminApi, billingApi, Plan } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Pencil, Trash2, Package, Users, Stethoscope,
  CheckCircle2, XCircle, Building2, CreditCard, AlertTriangle,
  Search, History,
} from "lucide-react";
import NextLink from "next/link";

const MODULE_META: Record<string, { label: string; desc: string }> = {
  reception: { label: "Reception", desc: "Patients, appointments, queue" },
  doctor:    { label: "Doctor",    desc: "Consultations, prescriptions, lab" },
  pharmacy:  { label: "Pharmacy",  desc: "Inventory, sales, dispensing" },
  admin:     { label: "Admin",     desc: "Users, departments, settings" },
};

const ADDON_MODULES = ["reception", "doctor", "pharmacy", "admin", "lab", "reports", "notifications"];

const STATUS_META: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  TRIAL:     { bg: "bg-blue-500/10",    text: "text-blue-400" },
  CANCELLED: { bg: "bg-rose-500/10",    text: "text-rose-400" },
  EXPIRED:   { bg: "bg-slate-800",      text: "text-slate-400" },
};

interface PlanForm {
  name: string; description: string; price: string; yearlyPrice: string;
  billingCycle: string; maxUsers: string; maxDoctors: string;
  trialDays: string; modules: string[]; features: string; sortOrder: string;
}
const emptyPlanForm: PlanForm = {
  name: "", description: "", price: "0", yearlyPrice: "",
  billingCycle: "BOTH", maxUsers: "5", maxDoctors: "1",
  trialDays: "0", modules: ["reception", "doctor"], features: "", sortOrder: "0",
};

interface AddonForm { name: string; description: string; price: string; module: string; }

export default function AdminSubscriptionsPage() {
  const [tab, setTab] = useState<"plans" | "orgs">("plans");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [allSubs, setAllSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState("");

  const [planDialog, setPlanDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState<PlanForm>(emptyPlanForm);

  const [addonDialog, setAddonDialog] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [addonForm, setAddonForm] = useState<AddonForm>({ name: "", description: "", price: "0", module: "pharmacy" });

  const [assignDialog, setAssignDialog] = useState(false);
  const [assignOrg, setAssignOrg] = useState<any>(null);
  const [assignPlanId, setAssignPlanId] = useState("");
  const [assignMonths, setAssignMonths] = useState(1);
  const [assignNote, setAssignNote] = useState("");

  const notify = (text: string, ok = true) => { setMessage({ text, ok }); setTimeout(() => setMessage(null), 3000); };

  const fetchAll = async () => {
    try {
      const [plansRes, addonsRes, subsRes] = await Promise.all([
        billingApi.getPlans(), billingApi.getAddons(), adminApi.getAllSubscriptions(),
      ]);
      setPlans(plansRes.data.data);
      setAddons(addonsRes.data.data);
      setAllSubs(subsRes.data.data);
      setFetchError("");
    } catch {
      setFetchError("Failed to load subscription data");
    }
    setLoading(false);
  };
  useEffect(() => { fetchAll(); }, []);

  // ─── Plan CRUD ──────────────────────────────────────────────────────────────
  const openAddPlan = () => { setEditingPlan(null); setPlanForm(emptyPlanForm); setPlanDialog(true); };
  const openEditPlan = (p: Plan) => {
    setEditingPlan(p);
    setPlanForm({
      name: p.name, description: p.description || "",
      price: String(p.price), yearlyPrice: String((p as any).yearlyPrice ?? ""),
      billingCycle: (p as any).billingCycle ?? "BOTH",
      maxUsers: p.maxUsers === -1 ? "0" : String(p.maxUsers),
      maxDoctors: p.maxDoctors === -1 ? "0" : String(p.maxDoctors),
      trialDays: String((p as any).trialDays ?? 0),
      modules: p.modules || [], features: p.features.join(", "),
      sortOrder: String((p as any).sortOrder || 0),
    });
    setPlanDialog(true);
  };
  const toggleModule = (m: string) =>
    setPlanForm((prev) => ({ ...prev, modules: prev.modules.includes(m) ? prev.modules.filter(x => x !== m) : [...prev.modules, m] }));
  const savePlan = async () => {
    const data = {
      name: planForm.name, description: planForm.description || undefined,
      price: Number(planForm.price) || 0,
      yearlyPrice: planForm.yearlyPrice ? Number(planForm.yearlyPrice) : undefined,
      billingCycle: planForm.billingCycle,
      maxUsers: Number(planForm.maxUsers) === 0 ? -1 : Number(planForm.maxUsers) || -1,
      maxDoctors: Number(planForm.maxDoctors) === 0 ? -1 : Number(planForm.maxDoctors) || -1,
      trialDays: Number(planForm.trialDays) || 0, modules: planForm.modules,
      features: planForm.features.split(",").map(f => f.trim()).filter(Boolean),
      sortOrder: Number(planForm.sortOrder) || 0,
    };
    try {
      if (editingPlan) await billingApi.updatePlan(editingPlan.id, data);
      else await billingApi.createPlan(data);
      notify(editingPlan ? "Plan updated!" : "Plan created!");
      setPlanDialog(false); fetchAll();
    } catch (err: any) { notify(err.response?.data?.message || "Failed", false); }
  };

  // ─── Addon CRUD ─────────────────────────────────────────────────────────────
  const openAddAddon = () => { setEditingAddon(null); setAddonForm({ name: "", description: "", price: "0", module: "pharmacy" }); setAddonDialog(true); };
  const openEditAddon = (a: any) => { setEditingAddon(a); setAddonForm({ name: a.name, description: a.description || "", price: String(a.price), module: a.module }); setAddonDialog(true); };
  const saveAddon = async () => {
    const data = { name: addonForm.name, description: addonForm.description || undefined, price: Number(addonForm.price) || 0, module: addonForm.module };
    try {
      if (editingAddon) await billingApi.updateAddon(editingAddon.id, data);
      else await billingApi.createAddon(data);
      notify("Add-on saved!"); setAddonDialog(false); fetchAll();
    } catch (err: any) { notify(err.response?.data?.message || "Failed", false); }
  };
  const deleteAddon = async (a: any) => {
    if (!confirm(`Delete "${a.name}"?`)) return;
    await billingApi.deleteAddon(a.id); notify("Add-on deleted"); fetchAll();
  };

  // ─── Force assign ────────────────────────────────────────────────────────────
  const openAssign = (sub: any) => { setAssignOrg(sub.organization); setAssignPlanId(sub.plan?.id ?? ""); setAssignMonths(1); setAssignNote(""); setAssignDialog(true); };
  const handleForceAssign = async () => {
    if (!assignOrg || !assignPlanId) return;
    try {
      await adminApi.forceAssignPlan(assignOrg.id, assignPlanId, assignMonths, assignNote || undefined);
      notify(`Plan assigned to ${assignOrg.name}`); setAssignDialog(false); fetchAll();
    } catch (err: any) { notify(err.response?.data?.message || "Failed", false); }
  };
  const handleForceCancel = async (sub: any) => {
    if (!confirm(`Cancel subscription for ${sub.organization.name}?`)) return;
    try { await adminApi.forceCancelSubscription(sub.organization.id); notify("Cancelled"); fetchAll(); }
    catch { notify("Failed", false); }
  };

  const fmtLim = (n: number, unit: string) => (n <= 0 ? `Unlimited ${unit}` : `${n} ${unit}`);

  const filteredSubs = allSubs.filter(s =>
    s.organization.name.toLowerCase().includes(search.toLowerCase()) ||
    s.organization.slug.toLowerCase().includes(search.toLowerCase())
  );

  const subStats = {
    active: allSubs.filter(s => s.status === "ACTIVE").length,
    trial: allSubs.filter(s => s.status === "TRIAL").length,
    cancelled: allSubs.filter(s => s.status === "CANCELLED").length,
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Subscriptions & Plans</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage plans, add-ons and organization subscriptions</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${message.ok ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
          {message.text}
        </div>
      )}

      {fetchError && (
        <div className="px-4 py-2.5 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{fetchError}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {(["plans", "orgs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? "border-rose-500 text-rose-400" : "border-transparent text-slate-500 hover:text-slate-300"
            }`}>
            {t === "plans" ? "Plans & Add-ons" : `Organization Subscriptions (${allSubs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : tab === "plans" ? (
        <div className="space-y-8">
          {/* Plans grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300">Subscription Plans ({plans.length})</h2>
              <Button onClick={openAddPlan} className="bg-rose-600 hover:bg-rose-700 text-white gap-2 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> New Plan
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className={`bg-slate-900 border rounded-xl p-5 flex flex-col ${plan.isActive ? "border-slate-800" : "border-slate-800 opacity-50"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{plan.name}</p>
                      {plan.description && <p className="text-[11px] text-slate-500 mt-0.5">{plan.description}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${plan.isActive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                      {plan.isActive ? "LIVE" : "OFF"}
                    </span>
                  </div>
                  <div className="mb-3">
                    <span className="text-2xl font-bold text-white">₹{plan.price.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">/mo</span>
                    {(plan as any).yearlyPrice && (
                      <p className="text-xs text-slate-500">₹{(plan as any).yearlyPrice?.toLocaleString()}/yr</p>
                    )}
                  </div>
                  {(plan as any).trialDays > 0 && (
                    <span className="text-[10px] font-medium text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full w-fit mb-2">
                      {(plan as any).trialDays}d free trial
                    </span>
                  )}
                  <div className="space-y-1 text-xs text-slate-400 mb-3 flex-1">
                    <div className="flex items-center gap-1.5"><Users className="w-3 h-3" />{fmtLim(plan.maxUsers, "users")}</div>
                    <div className="flex items-center gap-1.5"><Stethoscope className="w-3 h-3" />{fmtLim(plan.maxDoctors, "doctors")}</div>
                    <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" />Unlimited patients</div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {plan.modules.map(m => (
                      <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{MODULE_META[m]?.label ?? m}</span>
                    ))}
                  </div>
                  {plan.features.length > 0 && (
                    <ul className="space-y-0.5 mb-3">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {plan._count && <p className="text-[10px] text-slate-600 mb-3">{plan._count.subscriptions} subscriptions</p>}
                  <div className="flex gap-2 mt-auto">
                    <Button size="sm" variant="outline" onClick={() => openEditPlan(plan)}
                      className="flex-1 h-7 text-xs border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => billingApi.updatePlan(plan.id, { isActive: !plan.isActive }).then(fetchAll)}
                      className="flex-1 h-7 text-xs border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white">
                      {plan.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-400" /> Add-on Facilities ({addons.length})
              </h2>
              <Button onClick={openAddAddon} className="bg-violet-700 hover:bg-violet-800 text-white gap-2 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> New Add-on
              </Button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800/50">
              {addons.length === 0 && <p className="text-center text-slate-500 py-10 text-sm">No add-ons configured</p>}
              {addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-500/10 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{addon.name}</p>
                      {addon.description && <p className="text-[11px] text-slate-500">{addon.description}</p>}
                      <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded mt-0.5 inline-block">{addon.module}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white">₹{addon.price.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">/month</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditAddon(addon)} className="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteAddon(addon)} className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Organization subscriptions tab */
        <div className="space-y-4">
          {/* Summary pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Active", count: subStats.active, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
              { label: "Trial", count: subStats.trial, color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
              { label: "Cancelled", count: subStats.cancelled, color: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${s.color}`}>
                {s.label}: {s.count}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..."
                className="pl-9 pr-3 h-9 w-64 text-sm bg-slate-900 border border-slate-700 text-slate-200 rounded-lg outline-none focus:border-rose-500/50 placeholder:text-slate-600" />
            </div>
            <span className="text-xs text-slate-500">{filteredSubs.length} results</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organization</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Plan</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Expires</th>
                  <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredSubs.map((sub) => {
                  const m = STATUS_META[sub.status] ?? STATUS_META.EXPIRED;
                  const daysLeft = sub.endDate ? Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / 86400000) : null;
                  return (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-200">{sub.organization.name}</p>
                            <p className="text-[11px] text-slate-600">/{sub.organization.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <div>
                          <p className="text-xs font-medium text-slate-300">{sub.plan.name}</p>
                          <p className="text-[11px] text-slate-500">₹{sub.plan.price}/mo</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.bg} ${m.text}`}>{sub.status}</span>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {daysLeft !== null ? (
                          <span className={`text-xs ${daysLeft < 7 ? "text-rose-400" : "text-slate-400"}`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : "Expired"}
                          </span>
                        ) : <span className="text-xs text-slate-600">—</span>}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openAssign(sub)}
                            className="px-2.5 py-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Assign
                          </button>
                          {sub.status === "ACTIVE" && (
                            <button onClick={() => handleForceCancel(sub)}
                              className="px-2.5 py-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors">
                              Cancel
                            </button>
                          )}
                          <NextLink href={`/admin/organizations/${sub.organization.id}`}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                            View
                          </NextLink>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSubs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-500 text-sm">No subscriptions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Plan dialog */}
      <Dialog open={planDialog} onOpenChange={setPlanDialog}>
        <DialogContent className="max-w-lg bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="text-white">{editingPlan ? `Edit ${editingPlan.name}` : "New Plan"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); savePlan(); }} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-slate-400">Name *</Label><Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} required className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
              <div>
                <Label className="text-xs text-slate-400">Billing Cycle</Label>
                <select value={planForm.billingCycle} onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                  className="mt-1 w-full h-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none">
                  <option value="MONTHLY">Monthly only</option>
                  <option value="YEARLY">Yearly only</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>
            <div><Label className="text-xs text-slate-400">Description</Label><Input value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label className="text-xs text-slate-400">Monthly ₹</Label><Input type="number" value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
              <div><Label className="text-xs text-slate-400">Yearly ₹</Label><Input type="number" value={planForm.yearlyPrice} onChange={(e) => setPlanForm({ ...planForm, yearlyPrice: e.target.value })} placeholder="Optional" className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
              <div><Label className="text-xs text-slate-400">Trial Days</Label><Input type="number" value={planForm.trialDays} onChange={(e) => setPlanForm({ ...planForm, trialDays: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs text-slate-400">Max Users (0=∞)</Label><Input type="number" value={planForm.maxUsers} onChange={(e) => setPlanForm({ ...planForm, maxUsers: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
              <div><Label className="text-xs text-slate-400">Max Doctors (0=∞)</Label><Input type="number" value={planForm.maxDoctors} onChange={(e) => setPlanForm({ ...planForm, maxDoctors: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            </div>
            <div>
              <Label className="text-xs text-slate-400">Modules</Label>
              <div className="mt-1 grid grid-cols-2 gap-1.5">
                {Object.entries(MODULE_META).map(([key, meta]) => {
                  const on = planForm.modules.includes(key);
                  return (
                    <button type="button" key={key} onClick={() => toggleModule(key)}
                      className={`flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${on ? "border-rose-500/40 bg-rose-500/5" : "border-slate-700 hover:border-slate-600"}`}>
                      <div>
                        <p className="text-xs font-medium text-slate-200">{meta.label}</p>
                        <p className="text-[10px] text-slate-500">{meta.desc}</p>
                      </div>
                      {on ? <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div><Label className="text-xs text-slate-400">Features (comma separated)</Label><Input value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} placeholder="e.g. Reports, API access" className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Patients are unlimited on all plans</p>
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white">{editingPlan ? "Save Changes" : "Create Plan"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Addon dialog */}
      <Dialog open={addonDialog} onOpenChange={setAddonDialog}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="text-white">{editingAddon ? `Edit ${editingAddon.name}` : "New Add-on"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveAddon(); }} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-slate-400">Name *</Label><Input value={addonForm.name} onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })} required className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
              <div><Label className="text-xs text-slate-400">Price ₹/month</Label><Input type="number" value={addonForm.price} onChange={(e) => setAddonForm({ ...addonForm, price: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            </div>
            <div><Label className="text-xs text-slate-400">Description</Label><Input value={addonForm.description} onChange={(e) => setAddonForm({ ...addonForm, description: e.target.value })} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            <div>
              <Label className="text-xs text-slate-400">Module</Label>
              <select value={addonForm.module} onChange={(e) => setAddonForm({ ...addonForm, module: e.target.value })}
                className="mt-1 w-full h-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none">
                {ADDON_MODULES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
            <Button type="submit" className="w-full bg-violet-700 hover:bg-violet-800 text-white">{editingAddon ? "Save Changes" : "Create Add-on"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Force-assign dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent className="max-w-sm bg-slate-900 border-slate-700 text-white">
          <DialogHeader><DialogTitle className="text-white">Assign Plan</DialogTitle></DialogHeader>
          <p className="text-xs text-slate-400 -mt-1">Assigning to: <span className="text-white font-medium">{assignOrg?.name}</span></p>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs text-slate-400">Plan</Label>
              <select value={assignPlanId} onChange={(e) => setAssignPlanId(e.target.value)}
                className="mt-1 w-full h-8 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 px-3 text-xs outline-none">
                <option value="">Select a plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name} — ₹{p.price}/mo</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs text-slate-400">Months</Label><Input type="number" min={1} value={assignMonths} onChange={(e) => setAssignMonths(Number(e.target.value))} className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
              <div><Label className="text-xs text-slate-400">Note (optional)</Label><Input value={assignNote} onChange={(e) => setAssignNote(e.target.value)} placeholder="e.g. free upgrade" className="mt-1 bg-slate-800 border-slate-700 text-white h-8 text-sm" /></div>
            </div>
            <p className="text-[10px] text-slate-600">This overrides any existing subscription.</p>
            <Button onClick={handleForceAssign} disabled={!assignPlanId} className="w-full bg-rose-600 hover:bg-rose-700 text-white">Assign Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
