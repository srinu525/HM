"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Database,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  action: string;
  description?: string;
}

interface PermissionModule {
  name: string;
  permissions: Permission[];
}

const ROLES = [
  { value: "RECEPTIONIST", label: "Receptionist", color: "bg-green-100 text-green-700" },
  { value: "DOCTOR", label: "Doctor", color: "bg-blue-100 text-blue-700" },
  { value: "PHARMACIST", label: "Pharmacist", color: "bg-purple-100 text-purple-700" },
  { value: "ADMIN", label: "Admin", color: "bg-red-100 text-red-700" },
];

const MODULE_ICONS: Record<string, string> = {
  patients: "\uD83C\uDFE5",
  appointments: "\uD83D\uDCC5",
  consultations: "\uD83D\uDCCA",
  prescriptions: "\uD83D\uDC8A",
  pharmacy: "\uD83C\uDF3F",
  lab: "\uD83D\uDD2C",
  invoices: "\uD83D\uDCB0",
  users: "\uD83D\uDC65",
  departments: "\uD83C\uDFE2",
  settings: "\u2699\uFE0F",
  "audit-logs": "\uD83D\uDCDD",
  reports: "\uD83D\uDCC8",
  notifications: "\uD83D\uDD14",
};

const ACTION_COLORS: Record<string, string> = {
  read: "bg-blue-50 text-blue-700 border-blue-200",
  create: "bg-green-50 text-green-700 border-green-200",
  update: "bg-amber-50 text-amber-700 border-amber-200",
  delete: "bg-red-50 text-red-700 border-red-200",
  manage: "bg-purple-50 text-purple-700 border-purple-200",
  access: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function RolesPage() {
  const [modules, setModules] = useState<PermissionModule[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState("");
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  const fetchAllPermissions = useCallback(async () => {
    try {
      const res = await api.get("/permissions");
      // API returns { "patients": [...], "appointments": [...] } grouped by module
      // Convert to PermissionModule[] array
      const grouped = res.data.data as Record<string, Permission[]>;
      const moduleArray: PermissionModule[] = Object.entries(grouped).map(
        ([name, permissions]) => ({ name, permissions })
      );
      setModules(moduleArray);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load permissions");
    }
  }, []);

  const fetchRolePermissions = useCallback(async (role: string) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get(`/permissions/roles/${role}`);
      const perms = res.data.data as Permission[];
      setRolePermissions(new Set(perms.map((p) => p.id)));
      setHasChanges(false);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load role permissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPermissions();
  }, [fetchAllPermissions]);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    }
  }, [selectedRole, fetchRolePermissions]);

  const handlePermissionToggle = (permissionId: string) => {
    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleModuleToggle = (module: PermissionModule) => {
    const allIds = module.permissions.map((p) => p.id);
    const allChecked = allIds.every((id) => rolePermissions.has(id));

    setRolePermissions((prev) => {
      const next = new Set(prev);
      if (allChecked) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
    setHasChanges(true);
  };

  const handleSelectAll = () => {
    const allIds = modules.flatMap((m) => m.permissions.map((p) => p.id));
    const allChecked = allIds.every((id) => rolePermissions.has(id));

    setRolePermissions(() => {
      if (allChecked) {
        return new Set<string>();
      }
      return new Set(allIds);
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setMessage("");
    try {
      await api.put(`/permissions/roles/${selectedRole}`, {
        permissionIds: Array.from(rolePermissions),
      });
      setMessage(`Permissions saved for ${selectedRole} role`);
      setHasChanges(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setMessage("");
    try {
      await api.post("/permissions/seed");
      setMessage("Default permissions seeded successfully");
      await fetchAllPermissions();
      if (selectedRole) {
        await fetchRolePermissions(selectedRole);
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setMessage(err.response?.data?.message || "Failed to seed permissions");
    } finally {
      setSeeding(false);
    }
  };

  const toggleModuleCollapse = (moduleName: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleName)) {
        next.delete(moduleName);
      } else {
        next.add(moduleName);
      }
      return next;
    });
  };

  const totalPermissions = (modules ?? []).reduce((sum, m) => sum + m.permissions.length, 0);
  const checkedCount = (modules ?? [])
    .flatMap((m) => m.permissions)
    .filter((p) => rolePermissions.has(p.id)).length;

  const selectedRoleInfo = ROLES.find((r) => r.value === selectedRole);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">
            Configure access control for each role
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            {seeding ? "Seeding..." : "Seed Defaults"}
          </Button>
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("success") || message.includes("saved") || message.includes("seeded")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Selection
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <Label className="mb-2 block">Select Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => v && setSelectedRole(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <span className="flex items-center gap-2">
                        <Badge className={`${role.color} px-2 py-0.5 text-xs`}>
                          {role.label}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && !loading && (
              <div className="flex items-center gap-4 ml-auto">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Permissions</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {checkedCount} / {totalPermissions}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {checkedCount === totalPermissions ? "Deselect All" : "Select All"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedRole && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-500">Loading permissions...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedRoleInfo && (
                    <Badge className={`${selectedRoleInfo.color} px-3 py-1`}>
                      {selectedRoleInfo.label}
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {modules.length} modules
                  </span>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Permissions"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((module) => {
                  const isCollapsed = collapsedModules.has(module.name);
                  const modulePermIds = module.permissions.map((p) => p.id);
                  const checkedInModule = modulePermIds.filter((id) =>
                    rolePermissions.has(id)
                  ).length;
                  const allChecked = checkedInModule === modulePermIds.length;
                  const someChecked =
                    checkedInModule > 0 && checkedInModule < modulePermIds.length;

                  return (
                    <Card key={module.name} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleModuleCollapse(module.name)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isCollapsed ? (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                            <span className="text-lg">
                              {MODULE_ICONS[module.name] || "\uD83D\uDCCB"}
                            </span>
                            <CardTitle className="text-sm font-semibold capitalize">
                              {module.name.replace(/-/g, " ")}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {checkedInModule}/{modulePermIds.length}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleModuleToggle(module)}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                allChecked
                                  ? "bg-blue-600 border-blue-600"
                                  : someChecked
                                  ? "bg-blue-600/20 border-blue-600"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              {(allChecked || someChecked) && (
                                <CheckCircle2
                                  className={`h-3.5 w-3.5 ${
                                    allChecked ? "text-white" : "text-blue-600"
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      {!isCollapsed && (
                        <CardContent className="py-3">
                          <div className="space-y-1">
                            {module.permissions.map((perm) => {
                              const isChecked = rolePermissions.has(perm.id);
                              const actionColor =
                                ACTION_COLORS[perm.action.toLowerCase()] ||
                                "bg-gray-50 text-gray-700 border-gray-200";

                              return (
                                <label
                                  key={perm.id}
                                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                                    isChecked
                                      ? "bg-blue-50"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  <div className="relative flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() =>
                                        handlePermissionToggle(perm.id)
                                      }
                                      className="sr-only"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                        isChecked
                                          ? "bg-blue-600 border-blue-600"
                                          : "border-gray-300 hover:border-gray-400"
                                      }`}
                                    >
                                      {isChecked && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={3}
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-700 truncate">
                                        {perm.name}
                                      </span>
                                      <Badge
                                        className={`${actionColor} border px-1.5 py-0 text-[10px] font-medium uppercase`}
                                        variant="outline"
                                      >
                                        {perm.action}
                                      </Badge>
                                    </div>
                                    {perm.description && (
                                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                                        {perm.description}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>

              {hasChanges && (
                <div className="fixed bottom-6 right-6 z-50">
                  <Button onClick={handleSave} disabled={saving} size="lg" className="shadow-lg">
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!selectedRole && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">Select a role to manage permissions</p>
              <p className="text-sm mt-1">
                Choose a role from the dropdown above to configure its access permissions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
