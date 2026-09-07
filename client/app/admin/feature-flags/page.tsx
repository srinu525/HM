"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Zap, Building2, CheckCircle2, XCircle, Search } from "lucide-react";

const AVAILABLE_FLAGS = [
  { key: "appointments", name: "Appointments", desc: "Booking & queue management" },
  { key: "pharmacy", name: "Pharmacy", desc: "Inventory, sales, dispensing" },
  { key: "lab", name: "Lab", desc: "Tests & results" },
  { key: "billing", name: "Billing & Invoicing", desc: "Invoices and payments" },
  { key: "notifications", name: "Notifications", desc: "Real-time alerts" },
  { key: "audit_logs", name: "Audit Logs", desc: "Activity tracking" },
  { key: "file_uploads", name: "File Uploads", desc: "Document attachments" },
  { key: "reports", name: "Reports & Analytics", desc: "Stats and exports" },
];

export default function AdminFeatureFlagsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [flags, setFlags] = useState<{ key: string; name: string; desc: string; isEnabled: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getOrganizations().then((res) => setOrgs(res.data.data)).catch(() => setError("Failed to load organizations"));
  }, []);

  useEffect(() => {
    if (!selectedOrg) { setFlags([]); return; }
    setLoading(true);
    adminApi.getFeatureFlags(selectedOrg).then((res) => {
      const existing = res.data.data as { key: string; isEnabled: boolean }[];
      const merged = AVAILABLE_FLAGS.map((f) => {
        const found = existing.find((e) => e.key === f.key);
        return { ...f, isEnabled: found ? found.isEnabled : true };
      });
      setFlags(merged);
    }).catch(() => setFlags(AVAILABLE_FLAGS.map((f) => ({ ...f, isEnabled: true }))))
      .finally(() => setLoading(false));
  }, [selectedOrg]);

  const toggleFlag = async (key: string, current: boolean) => {
    if (!selectedOrg) return;
    setSaving(key);
    try {
      await adminApi.setFeatureFlag(selectedOrg, key, !current);
      setFlags((prev) => prev.map((f) => f.key === key ? { ...f, isEnabled: !current } : f));
    } catch { /* empty */ }
    setSaving(null);
  };

  const enableAll = async () => {
    if (!selectedOrg) return;
    try {
      await adminApi.bulkSetFeatureFlags(selectedOrg, AVAILABLE_FLAGS.map((f) => ({ key: f.key, isEnabled: true })));
      setFlags((prev) => prev.map((f) => ({ ...f, isEnabled: true })));
    } catch { /* empty */ }
  };

  const disableAll = async () => {
    if (!selectedOrg) return;
    setConfirmDisable(false);
    try {
      await adminApi.bulkSetFeatureFlags(selectedOrg, AVAILABLE_FLAGS.map((f) => ({ key: f.key, isEnabled: false })));
      setFlags((prev) => prev.map((f) => ({ ...f, isEnabled: false })));
    } catch { /* empty */ }
  };

  const selectedOrgName = orgs.find((o) => o.id === selectedOrg)?.name ?? "";
  const enabledCount = flags.filter((f) => f.isEnabled).length;

  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" /> Feature Flags
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Enable or disable modules per organization. Changes take effect immediately.</p>
      </div>

      {/* Org picker */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Select Organization</p>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..."
            className="pl-9 pr-3 h-9 w-full text-sm bg-slate-800 border border-slate-700 text-slate-200 rounded-lg outline-none focus:border-rose-500/50 placeholder:text-slate-600" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
          {filteredOrgs.map((org) => (
            <button key={org.id} onClick={() => setSelectedOrg(org.id)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all border ${
                selectedOrg === org.id
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}>
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{org.name}</p>
                <p className="text-[10px] text-slate-500 truncate">/{org.slug}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Flags panel */}
      {selectedOrg && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{error}</div>
          )}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">{selectedOrgName}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{enabledCount} of {flags.length} modules enabled</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDisable(true)} className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                Disable All
              </button>
              <button onClick={enableAll} className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors">
                Enable All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-slate-800 rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {flags.map((flag) => (
                <button key={flag.key} onClick={() => toggleFlag(flag.key, flag.isEnabled)}
                  disabled={saving === flag.key}
                  className={`relative flex flex-col p-4 rounded-xl border text-left transition-all ${
                    flag.isEnabled
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"
                  } ${saving === flag.key ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${flag.isEnabled ? "bg-emerald-500/20" : "bg-slate-700"}`}>
                      <Zap className={`w-3 h-3 ${flag.isEnabled ? "text-emerald-400" : "text-slate-500"}`} />
                    </div>
                    {flag.isEnabled
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <XCircle className="w-4 h-4 text-slate-600" />}
                  </div>
                  <p className={`text-xs font-semibold ${flag.isEnabled ? "text-slate-200" : "text-slate-500"}`}>{flag.name}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{flag.desc}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedOrg && (
        <div className="text-center py-16 text-slate-600">
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Select an organization to manage its feature flags</p>
        </div>
      )}

      {/* Disable All Confirmation */}
      {confirmDisable && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setConfirmDisable(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-white font-semibold mb-2">Disable All Modules?</h3>
            <p className="text-sm text-slate-400 mb-5">This will disable all feature flags for <span className="text-white font-medium">{selectedOrgName}</span>. Users will lose access to all modules immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDisable(false)} className="flex-1 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={disableAll} className="flex-1 px-3 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors">
                Disable All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
