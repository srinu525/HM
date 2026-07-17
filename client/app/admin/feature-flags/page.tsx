"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Flag, ToggleLeft, ToggleRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const AVAILABLE_FLAGS = [
  { key: "appointments", name: "Appointments Module" },
  { key: "pharmacy", name: "Pharmacy Module" },
  { key: "lab", name: "Lab Module" },
  { key: "billing", name: "Billing & Invoicing" },
  { key: "notifications", name: "Notifications" },
  { key: "audit_logs", name: "Audit Logs" },
  { key: "file_uploads", name: "File Uploads" },
  { key: "reports", name: "Reports & Analytics" },
];

export default function AdminFeatureFlagsPage() {
  const [orgs, setOrgs] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [flags, setFlags] = useState<{ key: string; name: string; isEnabled: boolean }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminApi.getOrganizations().then((res) => setOrgs(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedOrg) { setFlags([]); return; }
    setLoading(true);
    adminApi.getFeatureFlags(selectedOrg).then((res) => {
      const existing = res.data.data as { key: string; name: string; isEnabled: boolean }[];
      const merged = AVAILABLE_FLAGS.map(f => {
        const found = existing.find(e => e.key === f.key);
        return found || { ...f, isEnabled: true };
      });
      setFlags(merged);
    }).catch(() => setFlags(AVAILABLE_FLAGS.map(f => ({ ...f, isEnabled: true })))).finally(() => setLoading(false));
  }, [selectedOrg]);

  const toggleFlag = async (key: string, current: boolean) => {
    if (!selectedOrg) return;
    try {
      await adminApi.setFeatureFlag(selectedOrg, key, !current);
      setFlags(prev => prev.map(f => f.key === key ? { ...f, isEnabled: !f.isEnabled } : f));
    } catch { /* empty */ }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-gray-500 mt-1">Enable or disable modules per organization</p>
      </div>

      <div className="mb-6 max-w-xs">
        <Label>Select Organization</Label>
        <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Choose an organization...</option>
          {orgs.map(o => <option key={o.id} value={o.id}>{o.name} (/{o.slug})</option>)}
        </select>
      </div>

      {selectedOrg && (
        <div className="grid gap-3">
          {flags.map(flag => (
            <div key={flag.key} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flag className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">{flag.name}</div>
                  <div className="text-xs text-gray-500">{flag.key}</div>
                </div>
              </div>
              <button onClick={() => toggleFlag(flag.key, flag.isEnabled)} className={`p-1.5 rounded-lg transition-colors ${flag.isEnabled ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-50"}`}>
                {flag.isEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
