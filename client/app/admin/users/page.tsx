"use client";

import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api";
import { Users, ToggleLeft, ToggleRight, Shield, Search, Building2, User } from "lucide-react";

interface AdminUser {
  id: string; name: string; email: string; role: string;
  phone?: string; isActive: boolean; createdAt: string;
  organizationId?: string;
  organization?: { id: string; name: string; slug: string };
}

const ROLE_META: Record<string, { color: string; dot: string }> = {
  ADMIN:        { color: "text-blue-400 bg-blue-500/10",    dot: "bg-blue-400" },
  RECEPTIONIST: { color: "text-emerald-400 bg-emerald-500/10", dot: "bg-emerald-400" },
  DOCTOR:       { color: "text-violet-400 bg-violet-500/10",  dot: "bg-violet-400" },
  PHARMACIST:   { color: "text-amber-400 bg-amber-500/10",   dot: "bg-amber-400" },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    adminApi.getUsers().then((res) => { setUsers(res.data.data); setError(""); }).catch(() => setError("Failed to load users")).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || (u.organization?.name ?? "").toLowerCase().includes(s);
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchStatus = !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const roleCounts = users.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] ?? 0) + 1 }), {} as Record<string, number>);

  const handleToggle = async (user: AdminUser) => {
    await adminApi.updateUser(user.id, { isActive: !user.isActive });
    load();
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">All Users</h1>
          <p className="text-sm text-slate-400 mt-0.5">{users.length} users across all organizations</p>
        </div>
      </div>

      {error && <div className="px-4 py-2.5 rounded-lg text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20">{error}</div>}

      {/* Role pill counts */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(roleCounts).map(([role, count]) => {
          const meta = ROLE_META[role] ?? { color: "text-slate-400 bg-slate-700", dot: "bg-slate-400" };
          return (
            <button key={role} onClick={() => setRoleFilter(r => r === role ? "" : role)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                roleFilter === role
                  ? `${meta.color} border-current`
                  : "text-slate-500 bg-slate-800 border-slate-700 hover:border-slate-600"
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {role} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
        {roleFilter && (
          <button onClick={() => setRoleFilter("")} className="px-3 py-1.5 rounded-full text-xs text-slate-500 bg-slate-800 border border-slate-700 hover:border-slate-600">
            Clear filter
          </button>
        )}
      </div>

      {/* Search + status */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or org..."
            className="pl-9 pr-3 h-9 w-72 text-sm bg-slate-900 border border-slate-700 text-slate-200 rounded-lg outline-none focus:border-rose-500/50 placeholder:text-slate-600" />
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {[["", "All"], ["active", "Active"], ["inactive", "Inactive"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setStatusFilter(val)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === val ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}>{lbl}</button>
          ))}
        </div>
        <span className="self-center text-xs text-slate-500">{filtered.length} results</span>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl h-64 animate-pulse" />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Organization</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((user) => {
                const meta = ROLE_META[user.role] ?? { color: "text-slate-400 bg-slate-700", dot: "bg-slate-400" };
                return (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-semibold text-slate-300">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-200">{user.name}</p>
                          <p className="text-[11px] text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                        <Shield className="w-3 h-3" />{user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      {user.organization ? (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Building2 className="w-3 h-3" />
                          <span className="text-xs">{user.organization.name}</span>
                        </div>
                      ) : <span className="text-slate-600 text-xs">—</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 hidden lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleToggle(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                          user.isActive ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-slate-500 bg-slate-800 hover:bg-slate-700"
                        }`}>
                        {user.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        {user.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
