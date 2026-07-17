"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS = [
  { key: "platform_name", category: "general", label: "Platform Name", placeholder: "Hospital Management System" },
  { key: "support_email", category: "general", label: "Support Email", placeholder: "support@example.com" },
  { key: "max_organizations", category: "limits", label: "Max Organizations", placeholder: "Unlimited" },
  { key: "max_users_per_org", category: "limits", label: "Max Users per Org", placeholder: "50" },
  { key: "maintenance_mode", category: "general", label: "Maintenance Mode (true/false)", placeholder: "false" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const s = res.data.data as PlatformSetting[];
      setSettings(s);
      const map: Record<string, string> = {};
      s.forEach((item) => { map[item.key] = item.value; });
      setValues(map);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const def of DEFAULT_SETTINGS) {
        if (values[def.key] !== undefined) {
          await adminApi.setSetting(def.key, values[def.key], def.category);
        }
      }
    } catch { /* empty */ }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
          <p className="text-gray-500 mt-1">Configure global platform settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {DEFAULT_SETTINGS.map((def) => (
            <div key={def.key}>
              <Label>{def.label}</Label>
              <Input
                className="mt-1"
                value={values[def.key] || ""}
                placeholder={def.placeholder}
                onChange={(e) => setValues({ ...values, [def.key]: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Key: {def.key} • Category: {def.category}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
