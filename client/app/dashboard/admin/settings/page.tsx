"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Building2, Calendar, Pill, CreditCard, Check } from "lucide-react";

interface Setting {
  key: string;
  value: string;
  category: string;
}

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "appointment", label: "Appointment", icon: Calendar },
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
  { id: "billing", label: "Billing", icon: CreditCard },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface FieldDef {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  options?: string[];
}

const GENERAL_KEYS: FieldDef[] = [
  { key: "hospital_name", label: "Hospital Name", type: "text", placeholder: "Enter hospital name" },
  { key: "hospital_email", label: "Hospital Email", type: "email", placeholder: "hospital@example.com" },
  { key: "hospital_phone", label: "Hospital Phone", type: "tel", placeholder: "+1 (555) 000-0000" },
  { key: "hospital_address", label: "Address", type: "textarea", placeholder: "Full address" },
  { key: "hospital_logo", label: "Logo URL", type: "text", placeholder: "https://example.com/logo.png" },
  { key: "timezone", label: "Timezone", type: "select", options: ["UTC", "US/Eastern", "US/Central", "US/Pacific", "Europe/London", "Asia/Kolkata", "Asia/Tokyo"] },
  { key: "currency", label: "Currency", type: "select", options: ["USD", "EUR", "GBP", "INR", "JPY"] },
  { key: "gst_vat", label: "GST/VAT Number", type: "text", placeholder: "GST/VAT registration number" },
  { key: "hospital_license", label: "Hospital License Number", type: "text", placeholder: "License number" },
];

const APPOINTMENT_KEYS: FieldDef[] = [
  { key: "slot_duration", label: "Slot Duration (minutes)", type: "number", placeholder: "30" },
  { key: "max_patients_per_day", label: "Max Patients Per Day", type: "number", placeholder: "50" },
  { key: "online_booking_enabled", label: "Online Booking Enabled", type: "toggle" },
];

const PHARMACY_KEYS: FieldDef[] = [
  { key: "low_stock_threshold", label: "Low Stock Threshold", type: "number", placeholder: "10" },
  { key: "expiry_alert_days", label: "Expiry Alert Days", type: "number", placeholder: "30" },
];

const BILLING_KEYS: FieldDef[] = [
  { key: "tax_percentage", label: "Tax Percentage (%)", type: "number", placeholder: "18" },
  { key: "payment_methods", label: "Default Payment Methods", type: "text", placeholder: "Cash, Card, UPI, Insurance" },
];

const TAB_FIELDS: Record<TabId, FieldDef[]> = {
  general: GENERAL_KEYS,
  appointment: APPOINTMENT_KEYS,
  pharmacy: PHARMACY_KEYS,
  billing: BILLING_KEYS,
};

const CATEGORY_MAP: Record<TabId, string> = {
  general: "general",
  appointment: "appointment",
  pharmacy: "pharmacy",
  billing: "billing",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get("/settings");
      const settings: Setting[] = res.data.data;
      const map: Record<string, string> = {};
      for (const s of settings) {
        map[s.key] = s.value;
      }
      setValues(map);
      setInitialValues(map);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const fields = TAB_FIELDS[activeTab];
      const category = CATEGORY_MAP[activeTab];
      const dirtyFields = fields.filter((f) => values[f.key] !== initialValues[f.key]);
      if (dirtyFields.length === 0) {
        setMessage("No changes to save.");
        setLoading(false);
        return;
      }
      const settings = dirtyFields.map((f) => ({
        key: f.key,
        value: values[f.key] ?? "",
        category,
      }));
      await api.put("/settings/bulk", { settings });
      setInitialValues({ ...initialValues, ...Object.fromEntries(dirtyFields.map(f => [f.key, values[f.key] ?? ""])) });
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setMessage(error.response?.data?.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const updateValue = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderField = (field: typeof GENERAL_KEYS[number]) => {
    const val = values[field.key] ?? "";

    if (field.type === "select" && field.options) {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <Select value={val} onValueChange={(v) => v && updateValue(field.key, v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (field.type === "toggle") {
      return (
        <div key={field.key} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
          <Label className="cursor-pointer">{field.label}</Label>
          <button
            type="button"
            onClick={() => updateValue(field.key, val === "true" ? "false" : "true")}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
              val === "true" ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                val === "true" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      );
    }

    if (field.type === "textarea") {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{field.label}</Label>
          <textarea
            value={val}
            onChange={(e) => updateValue(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
        </div>
      );
    }

    return (
      <div key={field.key} className="space-y-2">
        <Label>{field.label}</Label>
        <Input
          type={field.type}
          value={val}
          onChange={(e) => updateValue(field.key, e.target.value)}
          placeholder={field.placeholder}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Settings</h1>
          <p className="text-gray-600 mt-1">Configure your hospital settings and preferences</p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm flex items-center gap-2 ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.includes("success") && <Check className="h-4 w-4" />}
          {message}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <div className="lg:w-56 shrink-0">
          <nav className="flex lg:flex-col gap-1 bg-gray-50 rounded-xl p-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMessage("");
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = TABS.find((t) => t.id === activeTab)!.icon;
                  return <Icon className="h-5 w-5" />;
                })()}
                {TABS.find((t) => t.id === activeTab)!.label} Settings
              </CardTitle>
              <Button onClick={handleSave} disabled={loading || fetching} className="min-w-[120px]">
                {loading ? "Saving..." : "Save Settings"}
              </Button>
            </CardHeader>
            <CardContent>
              {fetching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <div className="space-y-5 max-w-xl">
                  {TAB_FIELDS[activeTab].map(renderField)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
