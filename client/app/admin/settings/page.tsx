"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Settings, Save, Globe, Lock, Bell, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingDef {
  key: string; label: string; placeholder: string;
  category: string; type?: string; hint?: string;
}

const SETTING_GROUPS: { icon: React.ElementType; label: string; color: string; settings: SettingDef[] }[] = [
  {
    icon: Globe, label: "General", color: "text-sky-400",
    settings: [
      { key: "platform_name", label: "Platform Name", placeholder: "Hospital Management System", category: "general" },
      { key: "support_email", label: "Support Email", placeholder: "support@hms.com", category: "general", type: "email" },
      { key: "support_phone", label: "Support Phone", placeholder: "+91-XXXXXXXXXX", category: "general" },
      { key: "platform_url", label: "Platform URL", placeholder: "https://hms.yourdomain.com", category: "general" },
    ],
  },
  {
    icon: Sliders, label: "Limits", color: "text-amber-400",
    settings: [
      { key: "max_organizations", label: "Max Organizations", placeholder: "Unlimited (leave blank)", category: "limits", hint: "Leave blank for unlimited" },
      { key: "max_users_per_org", label: "Max Users per Org (default)", placeholder: "50", category: "limits" },
      { key: "free_trial_days", label: "Default Trial Days", placeholder: "14", category: "limits" },
      { key: "data_retention_days", label: "Audit Log Retention (days)", placeholder: "365", category: "limits" },
    ],
  },
  {
    icon: Bell, label: "Notifications", color: "text-violet-400",
    settings: [
      { key: "smtp_host", label: "SMTP Host", placeholder: "smtp.gmail.com", category: "notifications" },
      { key: "smtp_port", label: "SMTP Port", placeholder: "587", category: "notifications" },
      { key: "smtp_from", label: "From Email", placeholder: "noreply@hms.com", category: "notifications" },
      { key: "appointment_reminder_hours", label: "Appointment Reminder (hours before)", placeholder: "24", category: "notifications" },
    ],
  },
  {
    icon: Lock, label: "Security", color: "text-rose-400",
    settings: [
      { key: "maintenance_mode", label: "Maintenance Mode", placeholder: "false", category: "security", hint: "Set to 'true' to enable maintenance mode" },
      { key: "jwt_expiry_hours", label: "JWT Expiry (hours)", placeholder: "24", category: "security" },
      { key: "max_login_attempts", label: "Max Login Attempts", placeholder: "5", category: "security" },
      { key: "session_timeout_minutes", label: "Session Timeout (minutes)", placeholder: "60", category: "security" },
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getSettings().then((res) => {
      const map: Record<string, string> = {};
      (res.data.data as any[]).forEach((s) => { map[s.key] = s.value; });
      setValues(map);
      setError("");
    }).catch(() => setError("Failed to load platform settings")).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const allDefs = SETTING_GROUPS.flatMap((g) => g.settings);
      await Promise.all(
        allDefs
          .filter((d) => values[d.key] !== undefined && values[d.key] !== "")
          .map((d) => adminApi.setSetting(d.key, values[d.key], d.category))
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* empty */ }
    setSaving(false);
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl h-40" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-400" /> Platform Settings
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Global configuration for the entire platform</p>
        </div>
        <Button onClick={handleSave} disabled={saving}
          className={`gap-2 transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"} text-white`}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      {error && <div className="px-4 py-2.5 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{error}</div>}

      {SETTING_GROUPS.map((group) => (
        <div key={group.label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <group.icon className={`w-4 h-4 ${group.color}`} />
            <h3 className="text-sm font-semibold text-white">{group.label}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.settings.map((def) => (
              <div key={def.key}>
                <label className="block text-xs font-medium text-slate-400 mb-1">{def.label}</label>
                <input
                  type={def.type ?? "text"}
                  value={values[def.key] ?? ""}
                  placeholder={def.placeholder}
                  onChange={(e) => setValues({ ...values, [def.key]: e.target.value })}
                  className="w-full h-9 px-3 text-sm bg-slate-800 border border-slate-700 text-slate-200 rounded-lg outline-none focus:border-rose-500/50 placeholder:text-slate-600"
                />
                {def.hint && <p className="text-[10px] text-slate-600 mt-1">{def.hint}</p>}
                <p className="text-[10px] text-slate-700 mt-0.5">key: {def.key}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
